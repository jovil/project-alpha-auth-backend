const express = require("express");
const mongoose = require("mongoose");
const WaitingList = require("../model/waitingListModel");
const router = express.Router();

// Force index creation
mongoose.connection.on("open", () => {
  WaitingList.ensureIndexes();
});

router.post("/waiting_list", async (request, response) => {
  const { email } = request.body;
  try {
    const waitingList = new WaitingList({
      email,
    });

    await waitingList.save();

    response.status(201).json(waitingList);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      response.status(400).json({ error: "Email already exists" });
    } else {
      response.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
