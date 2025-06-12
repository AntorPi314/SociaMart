// routes/products.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); // ✅ use getDb instead of client

router.get('/', async (req, res) => {
  try {
    const db = getDb(); // ✅ safe because connectMongo already sets this
    const collection = db.collection("Best_Buy_Store");
    const products = await collection.find().toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
