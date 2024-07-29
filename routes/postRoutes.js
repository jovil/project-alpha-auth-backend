const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const sharp = require("sharp");
const Post = require("../model/postModel");

const s3 = new AWS.S3();

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const timestamp = Date.now();

const uploadFileToS3 = async (file, userDetails) => {
  const params = {
    Bucket: "jov-project-alpha-bucket",
    Key: `${userDetails.userName}/posts/${uuidv4()}-${timestamp}-${
      file.originalname
    }`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location; // S3 file URL
};

const savePostToDatabase = async (post, userDetails, fileUrl) => {
  // Example using Mongoose with MongoDB
  const newPost = new Post({
    user: userDetails.userId,
    email: post.email,
    characterName: post.characterName,
    seriesTitle: post.seriesTitle,
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
    const userDetails = { userId: post._id, userName: post.userName };
    const { buffer } = file;

    const compressedImage = await sharp(buffer)
      .resize({
        width: 1600,
        fit: sharp.fit.inside, // Preserve aspect ratio
        withoutEnlargement: true,
      })
      .toFormat("webp")
      .webp({ quality: 60 })
      .toBuffer();

    file.buffer = compressedImage;
    file.originalname = file.originalname.replace(/\..*/, `.webp`);
    file.mimetype = "image/webp";

    // Upload file to S3 and get the URL
    const fileUrl = await uploadFileToS3(file, userDetails);

    // Save post metadata to the database
    const savedPost = await savePostToDatabase(post, userDetails, fileUrl);
    // Populate the user field before sending the response
    const populatedPost = await Post.findById(savedPost._id).populate(
      "user",
      "userName avatar hasProducts"
    );

    response.send({
      message: "File and post saved successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.log("Error creating post:", error);
    response.status(500).send(error);
  }
});

router.get("/posts", async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(request.query.limit) || 9; // Default to 12 posts per page if not provided

    const posts = await Post.find({})
      .populate("user", "hasPosted userName hasProducts avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    response.json(posts);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get("/posts/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { limit } = request.query;
    let query = Post.find({ user: userId })
      .populate("user", "userName avatar")
      .sort({ createdAt: -1 });

    if (limit && limit > 0) query = query.limit(parseInt(limit));

    const posts = await query.exec(); // Execute the query

    response.json(posts);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
