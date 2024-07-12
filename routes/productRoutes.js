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

const uploadFilesToS3 = async (files) => {
  const fileUrls = await Promise.all(
    files.map(async (file) => {
      const params = {
        Bucket: "jov-project-alpha-bucket",
        Key: `${uuidv4()}-${timestamp}${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      return { url: uploadResult.Location }; // S3 file URL
    })
  );
  return fileUrls;
};

const saveProductToDatabase = async (product, fileUrls) => {
  // Example using Mongoose with MongoDB
  const newProduct = new Product({
    user: product._id,
    productName: product.productName,
    productDescription: product.productDescription,
    productPrice: product.price,
    fileUrl: fileUrls, // S3 file URL
    // other fields
  });

  await newProduct.save();
  return newProduct;
};

// Define the fields to handle multiple file uploads with different names
const uploadFields = [
  { name: "images-1", maxCount: 1 },
  { name: "images-2", maxCount: 1 },
  { name: "images-3", maxCount: 1 },
  { name: "images-4", maxCount: 1 },
];

router.post(
  "/create/product",
  upload.fields(uploadFields),
  async (request, response) => {
    try {
      const files = Object.values(request.files).flat();
      const product = JSON.parse(request.body.product);

      // console.log("files", files);
      // Upload files to S3 and get the URLs
      const fileUrls = await uploadFilesToS3(files);
      console.log("fileUrls", fileUrls);

      // Save product metadata to the database);
      const newProduct = await saveProductToDatabase(product, fileUrls);

      response.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      response.status(500).json({ error: "Internal Server Error" });
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
