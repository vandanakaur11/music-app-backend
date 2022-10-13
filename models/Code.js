const { Schema, model } = require("mongoose");

const codeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Code", codeSchema);
