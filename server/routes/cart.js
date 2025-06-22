// routes/cart.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserDb, getProductDb } = require("../db");
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware");

// GET /cart - fetch cart items grouped by shop with product and store details
router.get("/cart", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;

  try {
    const userDB = getUserDb();
    const productDB = getProductDb();
    const usersCollection = userDB.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { cart: 1 } }
    );

    if (!user) {
      return res.status(404).json([{ success: false, message: "User not found" }]);
    }

    const cart = user.cart || {};
    const detailedCart = {};

    for (const [storeId, productIds] of Object.entries(cart)) {
      if (!Array.isArray(productIds) || productIds.length === 0) continue;

      const productCollection = productDB.collection(storeId);

      const objectIds = productIds.map(id => {
        try {
          return new ObjectId(id);
        } catch {
          return null;
        }
      }).filter(Boolean);

      if (!objectIds.length) continue;

      const products = await productCollection
        .find({ _id: { $in: objectIds } })
        .toArray();

      const productsWithQuantity = products.map(p => {
        return {
          ...p,
          quantity: 1 // Set default quantity to 1; change if you're tracking per-product quantity
        };
      });

      const storeUser = await usersCollection.findOne(
        { _id: new ObjectId(storeId) },
        { projection: { name: 1, profilePIC: 1, URL: 1 } }
      );

      detailedCart[storeId] = {
        storeInfo: {
          _id: storeId,
          name: storeUser?.name || "Unknown Shop",
          profilePIC: storeUser?.profilePIC || "/assets/bx_store.svg",
          URL: storeUser?.URL || "#",
        },
        products: productsWithQuantity
      };
    }

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify([{ success: true, cart: detailedCart }], null, 2));
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json([{ success: false, message: "Failed to get cart" }]);
  }
});


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