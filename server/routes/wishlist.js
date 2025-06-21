// routes/wishlist.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserDb, getProductDb, getOrderDb } = require("../db");
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware"); 


// GET /wishlist - Get all wishlist items with product details and shop info
router.get("/wishlist", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;

  try {
    const userDB = getUserDb();
    const usersCollection = userDB.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { wishlists: 1 } }
    );

    if (!user) {
      return res.status(404).json([{ success: false, message: "User not found" }]);
    }

    const wishlists = user.wishlists || {};
    const productDB = getProductDb();

    const detailedWishlists = {};

    for (const [storeId, productIds] of Object.entries(wishlists)) {
      const productCollection = productDB.collection(storeId);

      const objectIds = productIds
        .map(id => {
          try {
            return new ObjectId(id);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (!objectIds.length) continue;

      const products = await productCollection
        .find({ _id: { $in: objectIds } })
        .toArray();

      const productsWithFlag = products.map(p => ({
        ...p,
        wishlist: true
      }));

      // Fetch store info
      const storeUser = await usersCollection.findOne(
        { _id: new ObjectId(storeId) },
        { projection: { name: 1, profilePIC: 1, URL: 1 } }
      );

      detailedWishlists[storeId] = {
        storeInfo: {
          _id: storeId,
          name: storeUser?.name || "Unnamed Shop",
          profilePIC: storeUser?.profilePIC || "/assets/bx_store.svg",
          URL: storeUser?.URL || "#",
        },
        products: productsWithFlag,
      };
    }

    // Final formatted response
    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify(
        [{ success: true, wishlists: detailedWishlists }],
        null,
        2
      )
    );

  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json([
      {
        success: false,
        message: "Failed to get wishlist"
      }
    ]);
  }
});




// ✅ POST /wishlist/add
router.post("/wishlist/add", authenticateToken, async (req, res) => {
  console.log("Incoming request body:", req.body);
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
          [`wishlists.${storeId}`]: productId, // ✅ keep as string
        },
      }
    );

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    res.status(500).json({ success: false, message: "Add failed" });
  }
});

// ✅ DELETE /wishlist/remove/:storeId/:productId
router.delete("/wishlist/remove/:storeId/:productId", authenticateToken, async (req, res) => {
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
          [`wishlists.${storeId}`]: productId, // ✅ keep as string
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