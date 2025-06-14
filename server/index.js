// index.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const wishlistRoutes = require("./routes/wishlist");
const storesRouter = require("./routes/stores");
const cartRouter = require("./routes/cart");
const { connectMongo } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/stores", storesRouter);
app.use("/", wishlistRoutes);
app.use('/', authRoutes);
app.use('/', productsRoutes);
app.use('/', cartRouter);

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
