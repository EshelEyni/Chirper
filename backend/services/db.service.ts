import { Collection, Db, MongoClient } from "mongodb";
import { error } from "./logger.service";
import config from "../config";

// Database Name
const dbName = "chirper_db";

let dbConn: Db | null = null;

export async function getCollection(
  collectionName: string
): Promise<Collection> {
  try {
    const db = await connect();
    const collection = await db.collection(collectionName);
    return collection;
  } catch (err) {
    error("Failed to get Mongo collection", err);
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
    error("Cannot Connect to DB", err);
    throw err;
  }
}
