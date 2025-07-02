// routes/posts.js
const express = require("express");
const router = express.Router();
const { getUserDb, getPostDb } = require("../db");
const { ObjectId } = require("mongodb");
const optionalAuthenticate = require("../middleware/optionalAuthenticate");

router.get("/posts/:storeURL", optionalAuthenticate, async (req, res) => {
  try {
    const storeURL = req.params.storeURL;

    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    // Find the store by URL
    const storeUser = await usersCollection.findOne({
      URL: { $regex: ^${storeURL}$, $options: "i" },
      isShop: true,
    });

    if (!storeUser) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const storeIdStr = storeUser._id.toString();

    const postDB = getPostDb();
    const postCollection = postDB.collection(storeIdStr);

    const rawPosts = await postCollection.find().toArray();

    // Get all unique post owner_ids
    const uniqueOwnerIds = [...new Set(rawPosts.map(p => p.owner_id?.toString()))]
      .filter(Boolean)
      .map(id => new ObjectId(id));

    // Get owner info in one query
    const owners = await usersCollection.find({ _id: { $in: uniqueOwnerIds } }).toArray();

    const ownerMap = {};
    owners.forEach((owner) => {
      ownerMap[owner._id.toString()] = {
        name: owner.name,
        profilePIC: owner.profilePIC,
      };
    });

    const currentUserId = req.user?.userId;

    const posts = rawPosts.map((post) => {
      const postOwnerId = post.owner_id?.toString() || "";
      const liked = currentUserId
        ? post.likedUsers?.includes(currentUserId)
        : false;

      return {
        _id: post._id,
        store_id: storeIdStr,
        createAt: post.createAt,
        likeCount: post.likeCount || 0,
        text: post.text || "",
        owner_id: post.owner_id,
        owner_name: ownerMap[postOwnerId]?.name || "Unknown",
        owner_profilePIC: ownerMap[postOwnerId]?.profilePIC || "/assets/avatar.svg",
        liked,
      };
    });

    res.json({
      success: true,
      storeId: storeIdStr,
      posts,
    });

  } catch (error) {
    console.error("Error in /posts/:storeURL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
