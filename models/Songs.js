const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const albumSchema = new Schema({
  Album_id: {
    type: Schema.Types.ObjectId,
    ref: "Album",
  },
  Album_Image: {
    type: String,
    required: true,
  },
  Album_Name: {
    type: String,
    required: true,
  },
  Song_Name: {
    type: String,
    required: true,
  },
  Song_Length: {
    type: String,
    required: true,
  },
  Song_Lyrics: {
    type: String,
  },
  Song_File: {
    type: String,
    // required: true,
  },
});

module.exports = mongoose.model("song", albumSchema);
