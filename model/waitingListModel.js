const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waitingListSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Ensure unique index is created
waitingListSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("WaitingList", waitingListSchema);
