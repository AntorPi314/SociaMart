// index.js
const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./db');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const postsRoutes = require('./routes/posts');
const wishlistRoutes = require("./routes/wishlist");
const storesRouter = require("./routes/stores");
const cartRouter = require("./routes/cart");
const likeRouter = require("./routes/like");
const profileRouter = require("./routes/profile");

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

app.use("/stores", storesRouter);
app.use("/", wishlistRoutes);
app.use('/', authRoutes);
app.use('/', productsRoutes);
app.use('/', postsRoutes);
app.use('/', cartRouter);
app.use('/', likeRouter);
app.use('/', profileRouter);

async function startServer() {
  try {
    await connectMongo();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to database', err);
    process.exit(1);
  }
}

startServer();
