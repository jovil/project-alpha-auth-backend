const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  email: String,
  title: String,
  description: String,
});

module.exports = mongoose.model.Posts || mongoose.model("Posts", postSchema);
