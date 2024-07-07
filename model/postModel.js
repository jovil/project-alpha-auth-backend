const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  email: String,
  fileUrl: String,
  caption: String,
});

module.exports = mongoose.model.Posts || mongoose.model("Posts", postSchema);
