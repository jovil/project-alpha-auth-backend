const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const Product = require("../model/productModel");

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

const saveProductToDatabase = async (product, fileUrl) => {
  // Example using Mongoose with MongoDB
  const newProduct = new Product({
    user: product._id,
    productName: product.productName,
    productDescription: product.productDescription,
    productPrice: product.price,
    fileUrl: fileUrl, // S3 file URL
    // other fields
  });

  await newProduct.save();
  return newProduct;
};

router.post(
  "/create/product",
  upload.single("image"),
  async (request, response) => {
    try {
      const file = request.file;
      const product = JSON.parse(request.body.product);

      // Upload file to S3 and get the URL
      const fileUrl = await uploadFileToS3(file);

      // Save product metadata to the database
      const savedProduct = await saveProductToDatabase(product, fileUrl);

      response.send({
        message: "File and product saved successfully",
        post: savedProduct,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  }
);

router.get("/products/:profileId", async (request, response) => {
  try {
    const { profileId } = request.params;

    Product.find({ user: profileId })
      .then((result) => {
        response.json(result);
      })
      .catch((err) => {
        console.error(err);
        response
          .status(500)
          .json({ error: "An error occurred while retrieving posts" });
      });
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/product/:productId", async (request, response) => {
  try {
    const { productId } = request.params;
    const product = await Product.findById(productId);

    response.json(product);
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = router;
