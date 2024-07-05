const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  email: String,
  image: String,
  caption: String,
});

module.exports = mongoose.model.Posts || mongoose.model("Posts", postSchema);
