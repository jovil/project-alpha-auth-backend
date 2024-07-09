const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: String,
  fileUrl: String,
  caption: String,
});

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
module.exports = Post;
