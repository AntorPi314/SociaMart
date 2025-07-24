// routes/wishlistHome.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserDb } = require("../db");
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware");

// ✅ POST /home/wishlist/add
router.post("/home/wishlist/add", authenticateToken, async (req, res) => {
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
          [`wishlists.${storeId}`]: productId,
        },
      }
    );

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ success: false, message: "Add failed" });
  }
});

// ✅ DELETE /home/wishlist/remove/:storeId/:productId
router.delete("/home/wishlist/remove/:storeId/:productId", authenticateToken, async (req, res) => {
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
          [`wishlists.${storeId}`]: productId,
        },
      }
    );

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    res.status(500).json({ success: false, message: "Remove failed" });
  }
});

module.exports = router;
