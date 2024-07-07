const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: String,
  fileUrl: String,
  caption: String,
});

module.exports = mongoose.model.Posts || mongoose.model("Posts", postSchema);
