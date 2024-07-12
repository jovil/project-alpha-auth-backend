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

const uploadFilesToS3 = async (file) => {
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
  upload.array("image", 4),
  async (request, response) => {
    try {
      const files = request.files;
      const product = JSON.parse(request.body.product);

      // Upload files to S3 and get the URLs
      const fileUrls = await Promise.all(
        files.map((file) => uploadFilesToS3(file))
      );

      // Save product metadata to the database
      const savedProduct = await saveProductToDatabase(product, fileUrls);

      response.send({
        message: "Files and product saved successfully",
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
    const products = await Product.find({ user: profileId });

    if (!products || products.length === 0) {
      return response.status(404).json({ message: "Products not found" });
    }

    console.log("Fetched products:", JSON.stringify(products, null, 2)); // Detailed logging

    response.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    response.status(500).json({ error: "Internal Server Error" });
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
