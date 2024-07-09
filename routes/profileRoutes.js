const express = require("express");
const router = express.Router();
const Profile = require("../model/profileModel");

router.post("/uploads", async (request, response) => {
  const { _id, email, avatar } = request.body;
  try {
    const newProfile = await Profile.create({
      user: _id,
      email: email,
      avatar: avatar,
    });
    await newProfile.save();
    response
      .status(201)
      .json({ message: "Profile created successfully", newProfile });
  } catch (error) {
    response.status(409).json({ message: error.message });
  }
});

router.get("/profile/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return response.status(404).json({ message: "Profile not found" });
    }

    response.json(profile);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
