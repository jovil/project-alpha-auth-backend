const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email Exist"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },
  userName: {
    type: String,
    required: [true, "Please provide a username!"],
    unique: true,
  },
  avatar: String,
  hasPosted: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
