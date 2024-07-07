const express = require("express");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const User = require("./model/userModel");
const Profile = require("./model/profileModel");
const Post = require("./model/postModel");
const auth = require("./auth");
const timestamp = Date.now();

const app = express();
const s3 = new AWS.S3();

// require database connection
const dbConnect = require("./db/dbConnect");

// execute database connection
dbConnect();

app.use(
  cors({
    origin: "*",
  })
);

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// compress responses
app.use(compression());
// body parser configuration
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  User.find({})
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      response.status(408).json({ error });
    });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
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

app.post("/uploads", async (request, response) => {
  const body = request.body;
  try {
    const newImage = await Profile.create(body);
    newImage.save();
    response.status(201).json({ message: "Image uploaded" });
  } catch (error) {
    response.status(409).json({ message: error.message });
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

const savePostToDatabase = async (post, fileUrl) => {
  // Example using Mongoose with MongoDB
  const newPost = new Post({
    email: post.email,
    caption: post.caption,
    fileUrl: fileUrl, // S3 file URL
    // other fields
  });

  await newPost.save();
  return newPost;
};

app.post("/create", upload.single("image"), async (request, response) => {
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

app.get("/posts", (request, response) => {
  Post.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((err) => {
      console.error(err);
      response
        .status(500)
        .json({ error: "An error occurred while retrieving posts" });
    });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  Profile.find({})
    .then((data) => {
      response.json(data);
    })
    .catch((error) => {
      response.status(408).json({ error });
    });
});

module.exports = app;
