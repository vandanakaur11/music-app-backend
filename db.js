const mongoose = require("mongoose");
require("dotenv").config();

module.exports = async function connectDB(params) {
  mongoose.connect(process.env.DB_CONNECT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const connection = mongoose.connection;
  connection
    .once("open", () => {
      console.log("Database Connected");
    })
    .catch((err) => {
      console.log({ err });
    });
};
