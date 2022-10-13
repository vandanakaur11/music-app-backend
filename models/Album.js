const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const albumSchema = new Schema({
  id: {
    type: String,
    require: true,
  },
  Album_Name: {
    type: String,
    require: true,
  },
  Album_Image: {
    type: String,
    require: true,
  },
  Singer_Name: {
    type: String,
    require: true,
  },
  Album_Image_nl: {
    type: String,
    require: true,
  },
  Song_Desc: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("album", albumSchema);
