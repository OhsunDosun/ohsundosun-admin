import express from "express";

import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { ComponentLoader } from "adminjs";

import { Resource, Database } from "@adminjs/prisma";
import { PrismaClient } from "@prisma/client";

import { v4 as uuid } from "uuid";
import { toBinaryUUID, fromBinaryUUID } from "binary-uuid";

import { initEnv } from "#util";

const env = initEnv();

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  console.log("HOOK PARAMS", params);
  if (params.action === "create") {
    if (params.args.data.uuid === undefined) {
      const bin = toBinaryUUID(uuid());
      params.args.data.uuid = bin;
    }
    if (!Buffer.isBuffer(params.args.data.uuid)) {
      const bin = toBinaryUUID(uuid());
      params.args.data.uuid = bin;
    }
  }
  const result = await next(params);

  if (Array.isArray(result)) {
    return result.map((row) => {
      if (row.uuid) {
        const uuid = fromBinaryUUID(row.uuid);
        row.uuid = uuid.toString();
      }
      return row;
    });
  } else {
    if (result.uuid) {
      const uuid = fromBinaryUUID(result.uuid);
      result.uuid = uuid.toString();
    }
    return result;
  }
});

AdminJS.registerAdapter({
  Resource: Resource,
  Database: Database,
});

const app = express();

const dmmf = prisma._baseDmmf;

const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add("Dashboard", "./dashboard"),
};

const usersProperties = [
  "id",
  "uuid",
  "email",
  "nickname",
  "mbti",
  "notification",
  "active",
  "created_at",
];

const postsProperties = [
  "id",
  "user_id",
  "uuid",
  "mbti",
  "title",
  "content",
  "like_count",
  "comment_count",
  "active",
  "created_at",
];

const commentsProperties = [
  "id",
  "post_id",
  "user_id",
  "uuid",
  "content",
  "active",
  "created_at",
];

const admin = new AdminJS({
  rootPath: "/",
  loginPath: "/login",
  logoutPath: "logout",
  componentLoader,
  branding: {
    companyName: "OhsunDosun",
    logo: "/asset/logo.png",
    withMadeWithLove: false,
  },
  locale: {
    language: "en",
    availableLanguages: ["en"],
    localeDetection: true,
    translations: {
      en: {
        components: {
          Login: {
            welcomeHeader: "Welcome",
            welcomeMessage: "OhsunDosun Admin",
          },
        },
      },
    },
  },
  dashboard: {
    component: Components.Dashboard,
  },
  resources: [
    {
      resource: { model: dmmf.modelMap.users, client: prisma },
      options: {
        navigation: true,
        listProperties: usersProperties,
        filterProperties: usersProperties,
        sort: {
          sortBy: "id",
          direction: "desc",
        },
      },
    },
    {
      resource: { model: dmmf.modelMap.posts, client: prisma },
      options: {
        navigation: true,
        listProperties: postsProperties,
        filterProperties: postsProperties,
        sort: {
          sortBy: "id",
          direction: "desc",
        },
      },
    },
    {
      resource: { model: dmmf.modelMap.comments, client: prisma },
      options: {
        navigation: true,
        listProperties: commentsProperties,
        filterProperties: commentsProperties,
        sort: {
          sortBy: "id",
          direction: "desc",
        },
      },
    },
    {
      resource: { model: dmmf.modelMap.user_ratings, client: prisma },
      options: {
        navigation: true,
        sort: {
          sortBy: "id",
          direction: "desc",
        },
      },
    },
    {
      resource: { model: dmmf.modelMap.reports, client: prisma },
      options: {
        navigation: true,
        sort: {
          sortBy: "id",
          direction: "desc",
        },
      },
    },
  ],
});

const DEFAULT_ADMIN = {
  email: env.adminEmail,
  password: env.adminPwd,
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate,
    cookiePassword: env.cookieSecret,
  },
  null,
  {
    resave: true,
    saveUninitialized: true,
    secret: env.sessionSecret,
  }
);

app.use(express.static("public"));

app.use(admin.options.rootPath, adminRouter);

app.listen(env.port);

BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};
