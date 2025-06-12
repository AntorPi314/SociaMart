const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
}, {
  collection: "Best_Buy_Store"  // Make sure this matches your MongoDB collection name exactly
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
