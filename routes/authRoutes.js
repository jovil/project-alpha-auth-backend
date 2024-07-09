const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Profile = require("../model/profileModel");

// register endpoint
router.post("/register", async (request, response) => {
  try {
    const { email, password, userName } = request.body;

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user instance and collect the data
    const newUser = await new User({
      email: email,
      password: hashedPassword,
      userName: request.body.userName,
    });

    // save the new user
    await newUser.save();

    // Create a profile for the new user
    const newProfile = new Profile({ user: newUser._id, email });
    await newProfile.save();

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
router.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
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
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

module.exports = router;
