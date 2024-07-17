const express = require("express");
const router = express.Router();
const auth = require("../auth");
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const User = require("../model/userModel");

const s3 = new AWS.S3();

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const timestamp = Date.now();

router.post("/update-hasPosted/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { hasPosted } = request.body;
    const user = await User.findByIdAndUpdate(userId, {
      hasPosted: hasPosted,
    });

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    console.log("Updated hasPosted:", user);
    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

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

    console.log("Updated hasProducts:", user);
    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// authentication endpoint
router.get("/auth-endpoint/:userId", auth, async (request, response) => {
  try {
    const userId = request.params.userId;
    const profile = await User.findOne({ user: userId });

    if (!profile)
      return response.status(404).json({ message: "Profile not found" });

    response.json(profile);
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});

router.get("/user/:userId", (request, response) => {
  const { userId } = request.params;
  User.findById(userId)
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      response.status(408).json({ error });
    });
});

router.get("/users/forHire", async (request, response) => {
  try {
    const usersForHire = await User.find({ hasHiringDetails: true });
    response.json(usersForHire);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

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

router.post("/user/update/bankDetails/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { name, bank, account } = request.body;

    const user = await User.findByIdAndUpdate(userId, {
      bankAccountDetails: {
        accountHoldersName: name,
        bankName: bank,
        accountNumber: account,
      },
    });
    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/user/update/hiringDetails/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const {
      email,
      whatsApp,
      location,
      favoriteCharacters,
      services,
      otherServices,
      availability,
      otherAvailability,
      preferredSchedule,
      travelAvailability,
      hasHiringDetails,
    } = request.body;

    const user = await User.findByIdAndUpdate(userId, {
      hasHiringDetails: hasHiringDetails,
      hiringDetails: {
        email: email,
        whatsApp: whatsApp,
        location: location,
        favoriteCharacters: favoriteCharacters,
        services: services.map((service) => ({
          service: service.service,
          serviceAvailable: service.serviceAvailable,
        })),
        otherServices: otherServices,
        availability: availability.map((available) => ({
          availabilityName: available.availabilityName,
          isAvailable: available.isAvailable,
        })),
        otherAvailability: otherAvailability,
        preferredSchedule: preferredSchedule,
        travelAvailability: travelAvailability,
      },
    });
    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
