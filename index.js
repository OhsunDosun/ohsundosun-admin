import express from "express";

import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";

import { Resource, Database } from "@adminjs/prisma";
import { PrismaClient } from "@prisma/client";

import { initEnv } from "#util";

import { User } from "./user.js";

const env = initEnv();

const prisma = new PrismaClient();

AdminJS.registerAdapter({
  Resource: Resource,
  Database: Database,
});

const app = express();

const dmmf = prisma._baseDmmf;

const admin = new AdminJS({
  rootPath: "/",
  loginPath: "/login",
  logoutPath: "logout",
  branding: {
    companyName: "OhsunDosun",
  },
  resources: [
    User,
    {
      resource: { model: dmmf.modelMap.users, client: prisma },
      options: {},
    },
  ],
});

const adminRouter = AdminJSExpress.buildRouter(admin);

app.use(admin.options.rootPath, adminRouter);

app.listen(env.port);

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};
