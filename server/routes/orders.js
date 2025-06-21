const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware");
const { getUserDb, getProductDb, getOrderDb } = require("../db");

router.post("/order", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;
  const { orders } = req.body;

  if (!orders || typeof orders !== "object" || Object.keys(orders).length === 0) {
    return res.status(400).json({ success: false, message: "Valid 'orders' object is required" });
  }

  try {
    const userDB = getUserDb();
    const productDB = getProductDb();
    const orderDB = getOrderDb();

    const usersCollection = userDB.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.address || "No address";
    const phone = user.phone || "No phone";
    const insertedOrders = [];

    for (const [storeId, items] of Object.entries(orders)) {
      if (!Array.isArray(items) || items.length === 0) continue;

      const productCollection = productDB.collection(storeId);
      const orderCollection = orderDB.collection(storeId);

      const validItems = items.filter(
        item => item.productId && typeof item.quantity === "number" && item.quantity > 0
      );

      const objectIds = validItems.map(item => {
        try {
          return new ObjectId(item.productId);
        } catch {
          return null;
        }
      }).filter(Boolean);

      if (!objectIds.length) continue;

      const products = await productCollection
        .find({ _id: { $in: objectIds } })
        .toArray();

      if (!products.length) continue;

      const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

      const orderDocs = validItems
        .map(({ productId, quantity }) => {
          const product = productMap[productId];
          if (!product) return null;

          const unitPrice = product.price || 0;

          return {
            user_id: userId.toString(),
            product_id: productId,
            title: product.title || "Untitled Product",
            image: product.images?.[0] || "/assets/default.jpg",
            quantity,
            price: unitPrice * quantity,
            status: "Confirm",
            createAt: new Date(),
            address,
            phone,
          };
        })
        .filter(Boolean);

      const result = await orderCollection.insertMany(orderDocs);
      const insertedIds = Object.values(result.insertedIds);
      const orderIdsAsStrings = insertedIds.map(id => id.toString());

      if (orderIdsAsStrings.length) {
        const productIdsToRemove = validItems.map(item => item.productId);

        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          {
            $push: {
              [`orders.${storeId}`]: { $each: orderIdsAsStrings },
            },
            $pull: {
              [`cart.${storeId}`]: { $in: productIdsToRemove },
            }
          }
        );

        insertedOrders.push(...orderDocs.map((doc, i) => ({
          ...doc,
          _id: orderIdsAsStrings[i]
        })));
      }
    }

    if (!insertedOrders.length) {
      return res.status(400).json({ success: false, message: "No valid orders inserted" });
    }

    res.json({
      success: true,
      message: "Orders placed successfully",
      orders: insertedOrders
    });

  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ success: false, message: "Failed to place orders" });
  }
});

module.exports = router;
