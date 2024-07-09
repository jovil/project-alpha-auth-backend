const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  avatar: String,
});

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
module.exports = Profile;
