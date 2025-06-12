// routes/stores.js

const express = require("express");
const router = express.Router();
const { getUserDb } = require("../db");
const authenticateToken = require("../routes/middleware/authMiddleware");
const { ObjectId } = require("mongodb");  // <-- Import ObjectId properly

const userDB = getUserDb();

router.get("/:storeURL", authenticateToken, async (req, res) => {
  try {
    const storeURL = req.params.storeURL;

    const user = await userDB.collection("users").findOne({ URL: storeURL, isShop: true });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Store not found",
      });
    }

    // Send store info (excluding sensitive data)
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name || "Best Buy Store",
        profilePIC: user.profilePIC || "/assets/bx_store.svg",
        URL: user.URL,
        followers: user.followers || 0,
        verified: user.verified || false,
      },
    });
  } catch (error) {
    console.error("Error in GET /stores/:storeURL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/follow/:storeId", authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const currentUserId = req.user.userId;

    if (!storeId) {
      return res.status(400).json({ success: false, message: "Store ID is required" });
    }

    if (currentUserId === storeId) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const store = await userDB.collection("users").findOne({ _id: new ObjectId(storeId), isShop: true });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // Update current user's followedStores array if not already followed
    await userDB.collection("users").updateOne(
      { _id: new ObjectId(currentUserId) },
      { $addToSet: { followedStores: store._id } }
    );

    // Increment the store's followers count
    await userDB.collection("users").updateOne(
      { _id: store._id },
      { $inc: { followers: 1 } }
    );

    res.json({ success: true, message: `Followed store ${store.name}` });
  } catch (error) {
    console.error("Error in POST /stores/follow/:storeId:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/unfollow/:storeId", authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const currentUserId = req.user.userId;

    if (!storeId) {
      return res.status(400).json({ success: false, message: "Store ID is required" });
    }

    const store = await userDB.collection("users").findOne({ _id: new ObjectId(storeId), isShop: true });
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // Remove storeId from current user's followedStores array
    await userDB.collection("users").updateOne(
      { _id: new ObjectId(currentUserId) },
      { $pull: { followedStores: store._id } }
    );

    // Decrement the store's followers count, ensuring it doesn't go below zero
    await userDB.collection("users").updateOne(
      { _id: store._id, followers: { $gt: 0 } },
      { $inc: { followers: -1 } }
    );

    res.json({ success: true, message: `Unfollowed store ${store.name}` });
  } catch (error) {
    console.error("Error in POST /stores/unfollow/:storeId:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
