const mongoose = require("mongoose");

const BankAccountDetailsSchema = new mongoose.Schema({
  accountHoldersName: {
    type: String,
    trim: true,
  },
  bankName: {
    type: String,
    trim: true,
  },
  accountNumber: {
    type: Number,
    trim: true,
  },
});

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
  avatar: { type: String, default: "" },
  hasPosted: { type: Boolean, default: false },
  hasProducts: { type: Boolean, default: false },
  bankAccountDetails: {
    type: BankAccountDetailsSchema,
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
