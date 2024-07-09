const express = require("express");
const router = express.Router();
const auth = require("../auth");
const User = require("../model/userModel");
const Profile = require("../model/profileModel");

router.post("/update-hasProducts/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { hasProducts } = request.body;
    const user = await User.findByIdAndUpdate(userId, {
      hasProducts: hasProducts,
    });

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    console.log("Updated user:", user);
    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// authentication endpoint
router.get("/auth-endpoint", auth, async (request, response) => {
  try {
    const userId = request.user.userId;
    const profile = await Profile.findOne({ user: userId });

    if (!profile)
      return response.status(404).json({ message: "Profile not found" });

    response.json(profile);
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});

module.exports = router;
