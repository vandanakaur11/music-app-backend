const { Schema, model } = require("mongoose");

const subscriptionPlanSchema = new Schema(
  {
    codeID: {
      type: Schema.Types.ObjectId,
      ref: "Code",
      required: [true, "A subscription plan must have a code!"],
    },
    durationID: {
      type: Schema.Types.ObjectId,
      ref: "Duration",
      required: [true, "A subscription plan must have a duration!"],
    },
    songDetail: [
      {
        albumID: {
          type: Schema.Types.ObjectId,
          ref: "album",
          required: [true, "A subscription plan must have atleast one album!"],
        },
        songIDs: [
          {
            type: Schema.Types.ObjectId,
            ref: "song",
            required: [true, "A subscription plan must have a song!"],
          },
        ],
      },
    ],
    price: {
      type: Number,
      required: [true, "A subscription plan must have a price!"],
      unique: [true, "A subscription plan must have unique price!"],
    },
  },
  { timestamps: true }
);

module.exports = model("SubscriptionPlan", subscriptionPlanSchema);
