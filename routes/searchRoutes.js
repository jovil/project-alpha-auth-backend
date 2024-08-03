const express = require("express");
const router = express.Router();
const User = require("../model/userModel");

router.get("/search/:searchQuery", async (request, response) => {
  try {
    const { searchQuery } = request.params;
    const user = await User.find({
      userName: { $regex: searchQuery, $options: "i" },
    });

    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
