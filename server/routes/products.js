// routes/products.js

const express = require("express");
const router = express.Router();
const { getUserDb, getProductDb } = require("../db");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

router.get("/products/:storeURL", async (req, res) => {
  try {
    const storeURL = req.params.storeURL;
    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    const storeUser = await usersCollection.findOne({
      URL: storeURL,
      isShop: true,
    });
    if (!storeUser)
      return res.status(404).json({ success: false, message: "Store not found" });

    let isFollowing = false;
    let wishlistMap = {};

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await usersCollection.findOne({
          _id: new ObjectId(decoded.userId),
        });

        if (currentUser?.followedStores) {
          isFollowing = currentUser.followedStores.some((id) =>
            id.equals(storeUser._id)
          );
        }

        if (
          currentUser?.wishlists &&
          currentUser.wishlists[storeUser._id.toString()]
        ) {
          for (const productId of currentUser.wishlists[
            storeUser._id.toString()
          ]) {
            wishlistMap[productId] = true;
          }
        }
      } catch (err) {
        console.warn("Invalid token while processing:", err.message);
      }
    }

    const productDB = getProductDb();
    let products = [];
    try {
      const productCollection = productDB.collection(storeUser._id.toString());
      products = await productCollection.find().toArray();
    } catch (err) {
      console.warn(`No product collection for user ${storeUser._id}`);
    }

    const productsWithWishlist = products.map((product) => ({
      ...product,
      wishlist: wishlistMap[product._id.toString()] || false,
    }));

    res.json({
      success: true,
      user: {
        _id: storeUser._id,
        name: storeUser.name || "Best Buy Store",
        profilePIC: storeUser.profilePIC || "/assets/bx_store.svg",
        URL: storeUser.URL,
        verified: storeUser.verified || false,
        followers: storeUser.followers || 0,
      },
      products: productsWithWishlist,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching store products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;
