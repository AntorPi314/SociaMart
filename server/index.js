const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3000;
const cors = require("cors");
const dbName = "martDB";

app.use(cors());

const uri = "mongodb+srv://antorhawlader50:70BANinsEWha0dFs@cluster-sociamart.rz1lv7m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-SociaMart";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 } );
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.get("/products", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("Best_Buy_Store");
    const products = await collection.find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
