// routes/cartHome.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserDb } = require("../db");
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware");

// ✅ POST /home/cart/add
router.post("/home/cart/add", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;
  const { productId, storeId } = req.body;

  if (!productId || !storeId) {
    return res.status(400).json({ success: false, message: "productId and storeId required" });
  }

  try {
    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: {
          [`cart.${storeId}`]: productId,
        },
      }
    );

    res.json({ success: true, message: "Added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: "Add failed" });
  }
});

module.exports = router;
