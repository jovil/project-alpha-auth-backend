const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invitationSchema = new Schema({
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["unused", "used"], default: "unused" },
  expirationDate: { type: Date, required: true },
});

module.exports = mongoose.model("Invitation", invitationSchema);
