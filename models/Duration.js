const { Schema, model } = require("mongoose");

const durationSchema = new Schema(
  {
    duration: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Duration", durationSchema);
