const express = require("express");
const router = express.Router();
const auth = require("../auth");
const AWS = require("aws-sdk");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../model/userModel");
const s3 = new AWS.S3();

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const timestamp = Date.now();

router.post("/user/profileDescription/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { profileDescription } = request.body;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        profileDescription: profileDescription,
      },
      { new: true } // This option returns the updated document
    );

    response.json(user);
  } catch (error) {
    console.log("error", error);
    response.status(500).json({ error: error.message });
  }
});

router.post("/user/shopDescription/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { shopDescription } = request.body;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        shopDescription: shopDescription,
      },
      { new: true } // This option returns the updated document
    );

    response.json(user);
  } catch (error) {
    console.log("error", error);
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

router.get("/user/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const user = await User.findById(userId).populate("productCount").exec();

    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.get("/users/forHire", async (request, response) => {
  try {
    const usersForHire = await User.find({ hasHiringDetails: true });
    response.json(usersForHire);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

const uploadFileToS3 = async (file, userDetails) => {
  const params = {
    Bucket: "jov-project-alpha-bucket",
    Key: `${userDetails.userName}/avatar/avatar.webp`,
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
    const userDetails = { userId: user._id, userName: user.userName };
    const { buffer } = file;

    const compressedImage = await sharp(buffer)
      .resize({
        width: 200,
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
    const savedAvatar = await saveAvatarToDatabase(user, fileUrl);

    response.send({
      message: "Image replaced successfully",
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

    const user = await User.findByIdAndUpdate(
      userId,
      {
        bankAccountDetails: {
          accountHoldersName: name,
          bankName: bank,
          accountNumber: account,
        },
      },
      { new: true } // This ensures the updated document is returned;
    );
    response.json(user);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

router.post("/user/update/hiringDetails/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const {
      headline,
      subheading,
      whatsApp,
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
        headline,
        subheading,
        whatsApp: whatsApp,
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

router.post(
  "/user/update/hiringDescription/:userId",
  async (request, response) => {
    const { userId } = request.params;
    const { hiringDescription } = request.body;

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            "hiringDetails.description": hiringDescription,
          },
        },
        { new: true }
      ); // This option ensures the updated document is returned);

      response.json(user);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
