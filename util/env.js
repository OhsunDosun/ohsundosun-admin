import { config } from "dotenv";

export const initEnv = () => {
  config();

  return {
    port: process.env.PORT || 3000,

    adminEmail: process.env.ADMIN_EMAIL || "test@test.com",
    adminPwd: process.env.ADMIN_PASSWORD || "1234",

    cookieSecret: process.env.COOKIE_SECRET || "1234",
    sessionSecret: process.env.SESSION_SECRET || "1234",
  };
};
