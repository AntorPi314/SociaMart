const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authenticate = require("../middleware/authMiddleware");
const { getPostDb } = require("../db");

// POST /like/add
router.post("/like/add", authenticate, async (req, res) => {
  try {
    const { shopId, postId } = req.body;
    console.log("Incoming request to /like/add:", { shopId, postId });

    if (!shopId || !postId) {
      return res.status(400).json({ success: false, message: "shopId and postId required" });
    }

    const postDB = getPostDb();
    const collection = postDB.collection(shopId);

    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        likedUsers: { $ne: req.user.userId },
      },
      {
        $addToSet: { likedUsers: req.user.userId },
        $inc: { likeCount: 1 },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Already liked or post not found" });
    }

    res.json({ success: true, message: "Liked" });
  } catch (err) {
    console.error("Error in /like/add:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /like/remove
router.post("/like/remove", authenticate, async (req, res) => {
  try {
    const { shopId, postId } = req.body;
    console.log("Incoming request to /like/remove:", { shopId, postId });

    if (!shopId || !postId) {
      return res.status(400).json({ success: false, message: "shopId and postId required" });
    }

    const postDB = getPostDb();
    const collection = postDB.collection(shopId);

    const result = await collection.updateOne(
      {
        _id: new ObjectId(postId),
        likedUsers: req.user.userId,
      },
      {
        $pull: { likedUsers: req.user.userId },
        $inc: { likeCount: -1 },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Not previously liked or post not found" });
    }

    res.json({ success: true, message: "Unliked" });
  } catch (err) {
    console.error("Error in /like/remove:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
