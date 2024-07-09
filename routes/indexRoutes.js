const express = require("express");
const router = express.Router();
const User = require("../model/userModel");

router.get("/", (request, response) => {
  User.find({})
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      response.status(408).json({ error });
    });
});

module.exports = router;
