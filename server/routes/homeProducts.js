// routes/homeProducts.js
const express = require("express");
const router = express.Router();
const { getUserDb, getProductDb, getPostDb } = require("../db");
const { ObjectId } = require("mongodb");
const optionalAuthenticate = require("../middleware/optionalAuthenticate");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

router.get("/home/products", optionalAuthenticate, async (req, res) => {
  try {
    const userDB = getUserDb();
    const productDB = getProductDb();
    const usersCollection = userDB.collection("users");

    const allStores = await usersCollection.find({ isShop: true }).toArray();

    let followedStores = [];
    let otherStores = [];

    if (req.user?.userId) {
      const currentUser = await usersCollection.findOne({ _id: req.user.userId });
      const followedIds = currentUser?.followedStores || [];

      followedStores = allStores.filter(store =>
        followedIds.some(id => id.equals(store._id))
      );

      otherStores = allStores.filter(store =>
        !followedIds.some(id => id.equals(store._id))
      );
    } else {
      otherStores = allStores;
    }

    shuffle(followedStores);
    shuffle(otherStores);

    const MAX_PRODUCTS = 25;
    const PRODUCTS_PER_STORE = 6;

    let productCount = 0;
    const results = [];

    const pickStores = (stores, targetProductCount) => {
      const selected = [];
      let i = 0;
      while (productCount < targetProductCount && i < stores.length) {
        selected.push(stores[i]);
        i++;
      }
      return selected;
    };

    let selectedStores = [];

    if (req.user) {
      const followedTarget = Math.floor(MAX_PRODUCTS * 0.7); // 70%
      const otherTarget = MAX_PRODUCTS - followedTarget;     // 30%

      const fromFollowed = pickStores(followedStores, followedTarget);
      const fromOthers = pickStores(otherStores, MAX_PRODUCTS);

      selectedStores = shuffle([...fromFollowed, ...fromOthers]);
    } else {
      selectedStores = pickStores(otherStores, MAX_PRODUCTS);
    }

    for (const store of selectedStores) {
      const collection = productDB.collection(store._id.toString());
      const remaining = MAX_PRODUCTS - productCount;
      if (remaining <= 0) break;

      const limit = Math.min(PRODUCTS_PER_STORE, remaining);
      const products = await collection.find().limit(limit).toArray();

      if (products.length > 0) {
        results.push({
          shop: {
            _id: store._id,
            name: store.name,
            profilePIC: store.profilePIC || "/assets/bx_store.svg",
            URL: store.URL,
            verified: store.verified || false,
          },
          products,
        });
        productCount += products.length;
        if (productCount >= MAX_PRODUCTS) break;
      }
    }

    // Ensure exactly 25 products by trimming if over
    if (productCount > MAX_PRODUCTS) {
      let trimmedResults = [];
      let count = 0;
      for (const entry of results) {
        const remaining = MAX_PRODUCTS - count;
        if (entry.products.length <= remaining) {
          trimmedResults.push(entry);
          count += entry.products.length;
        } else {
          trimmedResults.push({
            ...entry,
            products: entry.products.slice(0, remaining),
          });
          count += remaining;
          break;
        }
      }
      return res.json({ success: true, stores: trimmedResults });
    }

    res.json({ success: true, stores: results });
  } catch (err) {
    console.error("Error in /home/products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// GET /home/search?q=query (Search across all stores)
router.get("/home/search", optionalAuthenticate, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.json({ success: true, results: [] });

    const userDB = getUserDb();
    const productDB = getProductDb();
    const users = await userDB.collection("users").find({ isShop: true }).toArray();

    const results = [];

    for (const user of users) {
      const collection = productDB.collection(user._id.toString());

      // Try to match in 'title' field instead of 'name'
      const matched = await collection
        .find({ title: { $regex: query, $options: "i" } })
        .limit(6)
        .toArray();

      if (matched.length > 0) {
        results.push({
          shop: {
            _id: user._id,
            name: user.name,
            profilePIC: user.profilePIC || "/assets/bx_store.svg",
            URL: user.URL,
            verified: user.verified || false,
          },
          products: matched,
        });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("Error in /home/search:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;
