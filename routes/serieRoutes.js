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

router.get("/series", async (request, response) => {
  try {
    const uniqueSeriesTitles = await Post.distinct("seriesTitle"); // Get unique series titles
    response.json(uniqueSeriesTitles);
  } catch (error) {
    console.error("Error fetching unique series titles:", error);
  }
});

module.exports = router;
