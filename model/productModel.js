const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: [{ String }],
  productName: String,
  productDescription: String,
  productPrice: String,
  paymentLink: String,
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
module.exports = Product;
