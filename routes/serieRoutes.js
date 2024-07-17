const express = require("express");
const router = express.Router();
const Post = require("../model/postModel");

router.get("/series/:seriesTitle", async (request, response) => {
  try {
    const { seriesTitle } = request.params;
    const series = await Post.find({ seriesTitle: seriesTitle }).populate(
      "user",
      "userName avatar"
    );
    response.json(series);
  } catch (error) {
    response.status(500).json({ error });
  }
});

module.exports = router;
