const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  email: String,
  avatar: String,
});

module.exports =
  mongoose.model.Profiles || mongoose.model("Profiles", ProfileSchema);
