// routes/orders.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authenticateToken = require("../middleware/authMiddleware");
const { getUserDb, getProductDb, getOrderDb } = require("../db");


// In routes/orders.js or wherever
router.get("/manage-orders/:shopId/search-order/:orderId", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;
  const { shopId, orderId } = req.params;

  if (!ObjectId.isValid(shopId) || !ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: "Invalid IDs" });
  }

  try {
    const userDB = getUserDb();
    const orderDB = getOrderDb();

    // Confirm user owns shop
    const user = await userDB.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user._id.toString() !== shopId) {
      return res.status(403).json({ success: false, message: "Access denied: Not your shop" });
    }

    const order = await orderDB.collection(shopId).findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.patch("/update-order-status/:shopId/:orderId", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { shopId, orderId } = req.params;
  const { status } = req.body;

  if (!status || !["Cancel", "Processing", "Confirm", "Delivered"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  if (!ObjectId.isValid(shopId) || !ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: "Invalid IDs" });
  }

  try {
    const userDB = getUserDb();
    const orderDB = getOrderDb();

    const user = await userDB.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user._id.toString() !== shopId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const result = await orderDB.collection(shopId).updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status } }
    );

    if (result.modifiedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.status(404).json({ success: false, message: "Order not found or no change" });
    }
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/rate-product", authenticateToken, async (req, res) => {
  const { product_id, order_id, store_id, rating } = req.body;
  const userId = req.user.userId;
  console.log("BODY RECEIVED:", req.body);

  if (!product_id || !order_id || !store_id || rating == null) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const productDB = getProductDb();
    const orderDB = getOrderDb();

    const product = await productDB.collection(store_id).findOne({ _id: new ObjectId(product_id) });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const newCount = (product.ratingCount || 0) + 1;
    const newRating = ((product.rating || 0) * (newCount - 1) + rating) / newCount;

    await productDB.collection(store_id).updateOne(
      { _id: new ObjectId(product_id) },
      { $set: { rating: parseFloat(newRating.toFixed(2)), ratingCount: newCount } }
    );

    await orderDB.collection(store_id).updateOne(
      { _id: new ObjectId(order_id), user_id: userId },
      { $set: { ratingDone: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/manage-orders/:shopId", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;
  const { shopId } = req.params;

  if (!ObjectId.isValid(shopId)) {
    return res.status(400).json({ success: false, message: "Invalid shop ID" });
  }

  try {
    const userDB = getUserDb();
    const orderDB = getOrderDb();

    // Ensure user owns this shop
    const user = await userDB.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user || user._id.toString() !== shopId) {
      return res.status(403).json({ success: false, message: "Access denied: Not your shop" });
    }

    // Fetch only orders where status != 'Delivered'
    const orderCollection = orderDB.collection(shopId);
    const filteredOrders = await orderCollection
      .find({ status: { $ne: "Delivered" } })
      .sort({ createAt: -1 })
      .toArray();

    res.json({ success: true, orders: filteredOrders });
  } catch (err) {
    console.error("Manage orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch shop orders" });
  }
});



router.get("/my-orders", authenticateToken, async (req, res) => {
  const userId = req.user.userId || req.user._id;
  try {
    const userDB = getUserDb();
    const orderDB = getOrderDb();

    const user = await userDB.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user?.orders) {
      return res.json({ success: true, orders: {} });
    }

    const allOrders = {};

    for (const [storeId, orderIds] of Object.entries(user.orders)) {
      const orderCollection = orderDB.collection(storeId);
      const objectIds = orderIds.map((id) => new ObjectId(id));
      const orders = await orderCollection.find({ _id: { $in: objectIds } }).toArray();
      allOrders[storeId] = orders;
    }

    res.json({ success: true, orders: allOrders });
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});


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

    if (user.isShop === true) {
      return res.status(403).json({ success: false, message: "Shop owners are not allowed to place orders" });
    }

    const name = user.name || "No Name";
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
            status: "Processing",
            createAt: new Date(),
            name,
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
