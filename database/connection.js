import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { parseCookies } from "nookies";

let prismaInstance;

export function getPrisma() {
  if (!prismaInstance) {
    if (global.prisma) {
      prismaInstance = global.prisma;
    } else {
      let connectionString =
        process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

      if (connectionString && !connectionString.includes("uselibpqcompat")) {
        connectionString +=
          (connectionString.includes("?") ? "&" : "?") + "uselibpqcompat=true";
      }

      const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      pool.on("error", (err) => {
        // Suppress unhandled pool socket drop errors when serverless DB scales to zero
        if (err.code !== "ECONNRESET") {
          console.error("Postgres pool error:", err.message);
        }
      });

      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({ adapter });

      if (process.env.NODE_ENV !== "production") {
        global.prisma = prismaInstance;
      }
    }
  }
  return prismaInstance;
}

export async function db_model() {
  return { prisma: getPrisma() };
}

const connectDB = (handler) => async (req, res) => {
  const token = parseCookies({ req }).__token;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    req.isAuthenticated = true;
  } catch (err) {
    req.isAuthenticated = false;
  }

  const p = getPrisma();
  return handler(req, res, { prisma: p });
};

export default connectDB;
