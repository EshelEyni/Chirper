import { Collection, Db, MongoClient } from "mongodb";
import { logger } from "./logger.service.js";
import config from "../config/index.js";

// Database Name
const dbName = "chirper_db";

let dbConn: Db | null = null;

export async function getCollection(collectionName: string): Promise<Collection> {
  try {
    const db = await connect();
    const collection = await db.collection(collectionName);
    return collection;
  } catch (err) {
    logger.error("Failed to get Mongo collection", err as Error);
    throw err;
  }
}

async function connect() {
  if (dbConn) return dbConn;
  try {
    const client = await MongoClient.connect(config.dbURL);
    const db = client.db(dbName);
    dbConn = db;
    return db;
  } catch (err) {
    logger.error("Cannot Connect to DB", err as Error);
    throw err;
  }
}
