// db.js
const { MongoClient } = require("mongodb");
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

async function connectMongo() {
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

function getDb() {
  return client.db("martDB");  // your DB name here
}

function getUserDb() {
  return client.db("userDB");
}

function getProductDb() {
  return client.db("productDB");
}

function getPostDb() {
  return client.db("postDB");
}

function getOrderDb() {
  return client.db("orderDB");
}

module.exports = { client, connectMongo, getDb, getUserDb, getProductDb, getPostDb, getOrderDb };
