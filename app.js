const express = require("express");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
// require database connection
const dbConnect = require("./db/dbConnect");
const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const stripeRoutes = require("./routes/stripeRoutes");

const app = express();

// execute database connection
dbConnect();

app.use(
  cors({
    origin: "*",
  })
);

// compress responses
app.use(compression());
// body parser configuration
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", postRoutes);
app.use("/", userRoutes);
app.use("/", stripeRoutes);

module.exports = app;
