const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getUserDb, getProductDb } = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

// CREATE PRODUCT
router.post("/createProduct/:storeId", authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.user.userId;

    if (storeId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { title, des, price, left, images } = req.body;

    if (!title || !des || typeof price !== "number" || price <= 0) {
      return res.status(400).json({ success: false, message: "Invalid product data" });
    }

    const newProduct = {
      title,
      des,
      price,
      price_old: 0,
      left: left || 0,
      images: images || [],
      rating: 0,
      ratingCount: 0,
    };

    const productDB = getProductDb();
    const productCollection = productDB.collection(storeId);
    const result = await productCollection.insertOne(newProduct);

    res.json({ success: true, productId: result.insertedId });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// EDIT PRODUCT
router.put("/editProduct/:storeId/:productId", authenticateToken, async (req, res) => {
    try {
      const { storeId, productId } = req.params;
      const userId = req.user.userId;
  
      if (storeId !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
  
      const { title, des, price, left, images } = req.body;
  
      const productDB = getProductDb();
      const productCollection = productDB.collection(storeId);
  
      // Fetch the current product to preserve existing data
      const existingProduct = await productCollection.findOne({ _id: new ObjectId(productId) });
  
      if (!existingProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      const updateFields = {};
  
      if (title) updateFields.title = title;
      if (des) updateFields.des = des;
      if (typeof left === "number") updateFields.left = left;
      if (Array.isArray(images)) updateFields.images = images;
  
      // Handle price update with old price stored
      if (typeof price === "number" && price > 0 && price !== existingProduct.price) {
        updateFields.price_old = existingProduct.price;
        updateFields.price = price;
      }
  
      const result = await productCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateFields }
      );
  
      res.json({ success: true, message: "Product updated" });
  
    } catch (error) {
      console.error("Edit Product Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  

// DELETE PRODUCT
router.delete("/deleteProduct/:storeId/:productId", authenticateToken, async (req, res) => {
  try {
    const { storeId, productId } = req.params;
    const userId = req.user.userId;

    if (storeId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const productDB = getProductDb();
    const productCollection = productDB.collection(storeId);

    const result = await productCollection.deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
