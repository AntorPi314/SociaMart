const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate JWT (same as before)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// POST /wishlist/add - Add product to wishlist
router.post("/add", authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ message: "productId is required" });

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.status(200).json({ message: "Product added to wishlist" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /wishlist/check/:productId - Check if product is in wishlist
router.get("/check/:productId", authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const userEmail = req.user.email;
  
      // Find the user in DB by email
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if productId exists in the user's wishlist array
      const inWishlist = user.wishlist.includes(productId);
  
      // Send response with boolean inWishlist
      res.status(200).json({ inWishlist });
    } catch (error) {
      console.error("Error in /wishlist/check/:productId:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = router;
