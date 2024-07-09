const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Post = require("../model/postModel");

const s3 = new AWS.S3();

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const timestamp = Date.now();

const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: "jov-project-alpha-bucket",
    Key: `${uuidv4()}-${timestamp}${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // S3 file URL
};

const savePostToDatabase = async (post, fileUrl) => {
  // Example using Mongoose with MongoDB
  const newPost = new Post({
    user: post._id,
    email: post.email,
    caption: post.caption,
    fileUrl: fileUrl, // S3 file URL
    // other fields
  });

  await newPost.save();
  return newPost;
};

router.post("/create", upload.single("image"), async (request, response) => {
  try {
    const file = request.file;
    const post = JSON.parse(request.body.post);

    // Upload file to S3 and get the URL
    const fileUrl = await uploadFileToS3(file);

    // Save post metadata to the database
    const savedPost = await savePostToDatabase(post, fileUrl);

    response.send({
      message: "File and post saved successfully",
      post: savedPost,
    });
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/posts", async (request, response) => {
  try {
    const posts = await Post.find({}).populate("user", "hasProducts userName");

    response.json(posts);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
