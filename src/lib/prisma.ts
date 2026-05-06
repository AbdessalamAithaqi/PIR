import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Create the driver adapter using the same URL as migrations
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });

// Instantiate the Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
