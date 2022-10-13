const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const history = new Schema({
  userEmail: {
    type: String,
    required: true,
  },
  songName: {
    type: String,
    required: true,
  },
  albumName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("history", history);
