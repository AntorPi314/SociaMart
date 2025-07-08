// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { client } = require('../db');

const db = client.db("userDB");
const usersCollection = db.collection("users");

router.get('/signup', (req, res) => {
  res.send('✅ Signup GET route is working!');
});

router.get('/login', (req, res) => {
  res.send('✅ Login GET route is working!');
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, isShop, URL } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (isShop && !URL) {
      return res.status(400).json({ success: false, message: 'Shop URL is required' });
    }

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (isShop) {
      const existingURL = await usersCollection.findOne({ URL });
      if (existingURL) {
        return res.status(400).json({ success: false, message: 'Shop URL already in use' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePIC = isShop ? "/assets/shop.svg" : "/assets/customer.svg";

    const newUser = {
      name,
      email,
      password: hashedPassword,
      isShop: !!isShop,
      profilePIC,
      verified: false,
      followers: 0,
      ...(isShop && { URL }),
    };

    await usersCollection.insertOne(newUser);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, URL: user.URL, isShop: user.isShop },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        URL: user.URL,
        isShop: user.isShop,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
