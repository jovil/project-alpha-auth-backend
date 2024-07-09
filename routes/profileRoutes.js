const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Profile = require("../model/profileModel");
const User = require("../model/userModel");

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

const saveAvatarToDatabase = async (user, fileUrl) => {
  const newAvatar = await User.findByIdAndUpdate(user._id, {
    avatar: fileUrl,
  });

  await newAvatar.save();
  return newAvatar;
};

router.post("/uploads", upload.single("avatar"), async (request, response) => {
  try {
    const file = request.file;
    const user = JSON.parse(request.body.user);

    // Upload file to S3 and get the URL
    const fileUrl = await uploadFileToS3(file);

    // Save post metadata to the database
    const savedAvatar = await saveAvatarToDatabase(user, fileUrl);

    response.send({
      message: "File and post saved successfully",
      post: savedAvatar,
    });
  } catch (error) {
    response.status(409).json({ message: error.message });
  }
});

router.get("/profile/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const profile = await Profile.findOne({ user: userId }).populate("user");

    if (!profile) {
      return response.status(404).json({ message: "Profile not found" });
    }

    response.json(profile);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
