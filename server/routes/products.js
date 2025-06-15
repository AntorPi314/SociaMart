// routes/products.js
const express = require("express");
const router = express.Router();
const { getUserDb, getProductDb, getPostDb } = require("../db");
const { ObjectId } = require("mongodb");
const optionalAuthenticate = require("../middleware/optionalAuthenticate");

router.get("/products/:storeURL", optionalAuthenticate, async (req, res) => {
  try {
    const storeURL = req.params.storeURL;

    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    const storeUser = await usersCollection.findOne({
      URL: storeURL,
      isShop: true,
    });

    if (!storeUser) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    let isFollowing = false;
    let wishlistMap = {};

    if (req.user?.userId) {
      const currentUser = await usersCollection.findOne({
        _id: new ObjectId(req.user.userId),
      });

      // Follow status
      if (currentUser?.followedStores?.some(id => id.equals(storeUser._id))) {
        isFollowing = true;
      }

      // Wishlist map
      const wishlist = currentUser?.wishlists?.[storeUser._id.toString()] || [];
      wishlist.forEach(productId => {
        wishlistMap[productId] = true;
      });
    }

    // Fetch products
    const productDB = getProductDb();
    const productCollection = productDB.collection(storeUser._id.toString());
    const products = await productCollection.find().toArray();

    const productsWithWishlist = products.map(product => ({
      ...product,
      wishlist: !!wishlistMap[product._id.toString()],
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
    console.error("Error in /products/:storeURL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
