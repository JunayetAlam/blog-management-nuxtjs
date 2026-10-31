import { Prisma, PrismaClient } from "@prisma/client";

// Reuse one client across hot reloads in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Turns a unique-constraint race into a 409 instead of a 500
export function rethrowPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw createError({ statusCode: 409, message: "A record with this value already exists" });
  }
  throw error;
}
