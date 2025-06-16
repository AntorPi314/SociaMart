const express = require('express');
const { ObjectId } = require('mongodb');
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();
const { client } = require('../db');

const db = client.db("userDB");
const usersCollection = db.collection("users");

// Route 1: GET /profile/info
router.get('/profile/info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT middleware

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          _id: 1,
          name: 1,
          profilePIC: 1,
          URL: 1,
          address: 1,
          phone: 1,
        },
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile Info Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route 2: GET /profile/pic
router.get('/profile/pic', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: { profilePIC: 1 },
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, profilePIC: user.profilePIC });
  } catch (error) {
    console.error('Profile Pic Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
