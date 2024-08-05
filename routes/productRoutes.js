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

const deleteFileFromS3 = async (fileUrls) => {
  const productFileUrlArr = fileUrls.split(",");
  const fileKeys = productFileUrlArr.map((fileUrl) => {
    // Extract the file key from the URL
    const url = new URL(fileUrl);
    return url.pathname.substring(1); // Remove leading '/'
  });
  const objects = fileKeys.map((key) => ({ Key: key }));

  const params = {
    Bucket: "jov-project-alpha-bucket",
    Delete: {
      Objects: objects,
      Quiet: false, // Set to true to disable verbose mode
    },
  };

  try {
    const deleteResult = await s3.deleteObjects(params).promise();
    console.log("Delete operation result:", deleteResult);
  } catch (error) {
    console.error("Error deleting files:", error);
    throw error;
  }
};

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
    const { limit } = request.query;
    let query = Product.find({ user: userId })
      .populate("user", "userName")
      .sort({
        createdAt: -1,
      });

    if (limit && limit > 0) query = query.limit(parseInt(limit));

    const products = await query.exec(); // Execute the query

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

router.delete("/products/delete/:productId", async (request, response) => {
  const { productId } = request.params;
  const fileUrls = request.query.fileUrl;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    await deleteFileFromS3(fileUrls);

    response.json({
      message: "Product deleted successfully",
      post: deletedProduct,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
