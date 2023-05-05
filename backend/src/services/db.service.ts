import { Collection, Db } from "mongodb";
const { MongoClient } = require("mongodb");
const { logger } = require("./logger.service");
const config = require("../config");

// Database Name
const dbName = "chirper_db";

let dbConn: Db | null = null;

async function getCollection(collectionName: string): Promise<Collection> {
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

module.exports = {
  getCollection,
};
