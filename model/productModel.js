const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: String,
  productName: String,
  productDescription: String,
  productPrice: String,
});

const Product =
  mongoose.model.Products || mongoose.model("Products", ProductSchema);
module.exports = Product;
