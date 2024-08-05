const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

// register endpoint
router.post("/register", async (request, response) => {
  try {
    const { email, password, userName, state, city } = request.body;

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user instance and collect the data
    const newUser = await new User({
      email: email,
      password: hashedPassword,
      userName: userName,
      state: state,
      city: city,
    });

    // save the new user
    await newUser.save();

    console.log("New user created:", newUser);

    const user = await User.findOne({ email });

    if (!user) {
      return response.status(404).send({ message: "Email not found" });
    }

    // compare the password entered and the hashed password found
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return response.status(400).send({ message: "Passwords do not match" });
    }

    // create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        userEmail: user.email,
      },
      "RANDOM-TOKEN",
      { expiresIn: "24h" }
    );

    //   return success response
    response.status(200).send({
      _id: user._id,
      message: "Registration and Login Successful",
      email: user.email,
      userName: user.userName,
      state: user.state,
      city: user.city,
      token,
    });
  } catch (error) {
    response.status(500).send({
      message: "Error during registration and login",
      error,
    });
  }
});

// login endpoint
router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email }).populate("productCount").exec();

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    //   create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        userEmail: user.email,
      },
      "RANDOM-TOKEN",
      { expiresIn: "24h" }
    );

    //   return success response
    response.status(200).send({
      _id: user._id,
      message: "Login Successful",
      email: user.email,
      userName: user.userName,
      state: user.state,
      city: user.city,
      hasProducts: user.hasProducts,
      hasHiringDetails: user.hasHiringDetails,
      avatar: user.avatar,
      profileDescription: user.profileDescription,
      shopDescription: user.shopDescription,
      productCount: user.productCount,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
