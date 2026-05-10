import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./database";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://meowmeal-frontend.vercel.app",
    "https://meowmeal-backend.onrender.com",
    process.env.CLIENT_URL as string,
  ].filter(Boolean),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Auth = typeof auth;
