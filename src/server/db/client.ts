import { PrismaClient } from "@prisma/client";

import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
console.log(env)
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}