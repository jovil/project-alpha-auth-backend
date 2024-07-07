const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: String,
  avatar: String,
});

const Profile =
  mongoose.model.Profiles || mongoose.model("Profiles", ProfileSchema);
module.exports = Profile;
