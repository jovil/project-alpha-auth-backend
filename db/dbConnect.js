// external imports
const mongoose = require("mongoose");
require('dotenv').config()

const urlEncodedPassword = encodeURIComponent(process.env.DB_PASSWORD);

async function dbConnect() {
  // use mongoose to connect this app to our database on mongoDB using the DB_URL (connection string)
  mongoose
    .connect(
      `mongodb+srv://jovilhiew:${urlEncodedPassword}@cluster0.naycgyd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
      {
        //   these are options to ensure that the connection is done properly
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;
