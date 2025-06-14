// routes/cart.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserDb } = require("../db");
const { ObjectId } = require("mongodb");

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token" });
    req.user = decoded; // decoded should contain userId (or _id)
    next();
  });
};

// ✅ POST /cart/add
router.post("/cart/add", authenticateToken, async (req, res) => {
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

// ✅ DELETE /cart/remove/:storeId/:productId
router.delete("/cart/remove/:storeId/:productId", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;
  const { storeId, productId } = req.params;

  if (!productId || !storeId) {
    return res.status(400).json({ success: false, message: "storeId and productId required" });
  }

  try {
    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          [`cart.${storeId}`]: productId, 
        },
      }
    );

    res.json({ success: true, message: "Removed from cart" });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ success: false, message: "Remove failed" });
  }
});

module.exports = router;