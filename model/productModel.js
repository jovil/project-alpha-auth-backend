const mongoose = require("mongoose");

// Define the schema for the file URL object
const FileUrlSchema = new mongoose.Schema({
  url: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: [FileUrlSchema],
  productName: String,
  productDescription: String,
  productPrice: String,
  paymentLink: String,
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
module.exports = Product;
