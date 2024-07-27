const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const sharp = require("sharp");
const Product = require("../model/productModel");

const s3 = new AWS.S3();

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const timestamp = Date.now();

const uploadFilesToS3 = async (files, userDetails, productName) => {
  const fileUrls = await Promise.all(
    files.map(async (file) => {
      const params = {
        Bucket: "jov-project-alpha-bucket",
        Key: `${
          userDetails.userName
        }/products/${productName}/${uuidv4()}-${timestamp}${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location; // S3 file URL
    })
  );
  return fileUrls;
};

const saveProductToDatabase = async (product, userDetails, fileUrls) => {
  // Example using Mongoose with MongoDB
  const newProduct = new Product({
    user: userDetails.userId,
    productName: product.productName,
    productDescription: product.productDescription,
    productPrice: product.price,
    fileUrl: fileUrls, // S3 file URL
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
      const userDetails = { userId: product._id, userName: product.userName };
      const productName = product.productName;

      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const newBuffer = await sharp(file.buffer)
            .resize({
              width: 1600,
              fit: sharp.fit.inside, // Preserve aspect ratio
              withoutEnlargement: true,
            })
            .toFormat("webp")
            .webp({ quality: 60 })
            .toBuffer();

          return {
            ...file,
            originalname: file.originalname.replace(/\..*/, `.webp`),
            buffer: newBuffer,
            mimetype: "image/webp",
          };
        })
      );

      // Upload files to S3 and get the URLs
      const fileUrls = await uploadFilesToS3(
        processedFiles,
        userDetails,
        productName
      );

      // Save product metadata to the database);
      const newProduct = await saveProductToDatabase(
        product,
        userDetails,
        fileUrls
      );

      response.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      response.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/products/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const products = await Product.find({ user: userId });

    if (!products || products.length === 0) {
      return response.status(404).json({ message: "Products not found" });
    }

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

router.get("/products", async (request, response) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .populate("user", "userName avatar");

    response.json(products);
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = router;
