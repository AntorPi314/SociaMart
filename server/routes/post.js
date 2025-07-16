// routes/post.js
const express = require("express");
const router = express.Router();
const { getUserDb, getPostDb } = require("../db");
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware");

// POST: Create a new post
router.post("/post/:storeURL", authenticateToken, async (req, res) => {
  try {
    const storeURL = req.params.storeURL;
    const { text, post_image_link } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    const storeUser = await usersCollection.findOne({
      URL: storeURL,
      isShop: true,
    });

    if (!storeUser) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const storeIdStr = storeUser._id.toString();
    const postDB = getPostDb();
    const postCollection = postDB.collection(storeIdStr);

    const newPost = {
      owner_id: new ObjectId(req.user.userId),
      text,
      likeCount: 0,
      likedUsers: [],
      createAt: new Date(),
      ...(post_image_link && { post_image_link }),
    };

    const result = await postCollection.insertOne(newPost);

    res.status(201).json({
      success: true,
      message: "Post created",
      postId: result.insertedId,
    });

  } catch (error) {
    console.error("Error in POST /post/:storeURL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE: Only post owner or store owner can delete (using storeId now)
router.delete("/post/:storeId/:postId", authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const postId = req.params.postId;
    const userId = req.user.userId;

    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    const storeUser = await usersCollection.findOne({
      _id: new ObjectId(storeId),
      isShop: true,
    });

    if (!storeUser) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const postDB = getPostDb();
    const postCollection = postDB.collection(storeId);

    const post = await postCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isPostOwner = post.owner_id?.toString() === userId;
    const isStoreOwner = storeUser._id.toString() === userId;

    if (!isPostOwner && !isStoreOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this post" });
    }

    await postCollection.deleteOne({ _id: new ObjectId(postId) });

    res.json({ success: true, message: "Post deleted" });

  } catch (error) {
    console.error("Error in DELETE /post/:storeId/:postId:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
