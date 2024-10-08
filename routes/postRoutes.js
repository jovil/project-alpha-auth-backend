const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const sharp = require("sharp");
const Post = require("../model/postModel");
const User = require("../model/userModel");
const s3 = new AWS.S3();

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const timestamp = Date.now();

const deleteFileFromS3 = async (fileUrl) => {
  // Extract the file key from the URL
  const url = new URL(fileUrl);
  const fileKey = url.pathname.substring(1); // Remove leading '/'

  const params = {
    Bucket: "jov-project-alpha-bucket",
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`File deleted successfully: ${fileKey}`);
  } catch (error) {
    console.error(`Error deleting file: ${fileKey}`, error);
    throw error;
  }
};

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
    title: post.title,
    description: post.description,
    tags: post.tags,
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
    const populatedPost = await Post.findById(savedPost._id).populate({
      path: "user",
      select: "userName avatar",
      populate: {
        path: "productCount",
        options: { virtuals: true }, // Ensure virtual fields are included
      },
    });

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
      .populate({
        path: "user",
        select: "userName avatar",
        populate: {
          path: "productCount",
          options: { virtuals: true }, // Ensure virtual fields are included
        },
      })
      .lean({ virtuals: true }) // Use lean to convert to plain JS object
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

router.delete("/posts/delete/:postId", async (request, response) => {
  const { postId } = request.params;
  const fileUrl = request.query.fileUrl;
  const userId = request.query.userId;

  try {
    const deletedPost = await Post.findByIdAndDelete(postId);
    await deleteFileFromS3(fileUrl);

    // Get the updated user with post count
    const updatedUser = await User.findById(userId)
      .populate({ path: "postCount" })
      .lean({ virtuals: true });

    response.json({
      message: "Post deleted successfully",
      post: deletedPost,
      postCount: updatedUser.postCount,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
