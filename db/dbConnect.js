// external imports
const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  // use mongoose to connect this app to our database on mongoDB using the DB_URL (connection string)
  mongoose
    .connect(`${process.env.DATABASE_URL}`)
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
      console.log("Mongoose version:", mongoose.version);
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;
