import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema.js";
import { sdk } from "./sdk.js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export const DEFAULT_USER: User = {
  id: 1,
  openId: "guest-default",
  name: "Usuário Resoluty",
  email: "admin@resoluty.com",
  loginMethod: "guest",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  if (!user) {
    user = DEFAULT_USER;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
