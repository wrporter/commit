import { PrismaClient } from "@prisma/client";
import { log } from "@wesp-up/express-remix";

import { env } from "#server/env.server";

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (env.NODE_ENV === "production") {
  prisma = getClient();
} else {
  if (!global.__db__) {
    global.__db__ = getClient();
  }
  prisma = global.__db__;
}

function getClient() {
  const databaseUrl = new URL(env.DATABASE_URL);
  log.info(`🔌 setting up prisma client to ${databaseUrl.host}`);

  // NOTE: during development if you change anything in this function, remember
  // that this only runs once per server restart and won't automatically be
  // re-run per request like everything else is. So if you need to change
  // something in this file, you'll need to manually restart the server.
  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });

  // connect eagerly
  client.$connect();

  log.info("Successfully connected to the Mongo database!");

  return client;
}

export { prisma };
