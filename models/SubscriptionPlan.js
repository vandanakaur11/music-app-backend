const { Schema, model } = require("mongoose");

const subscriptionPlanSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "A subscription plan must have a code!"],
    },
    duration: {
      type: Number,
      required: [true, "A subscription plan must have a duration!"],
      unique: [true, "A subscription plan must have unique duration!"],
    },
    songDetail: [
      {
        album: {
          type: String,
          // required: [true, "A subscription plan must have atleast one album!"],
        },
        songs: [
          {
            type: Object,
            // required: [true, "A subscription plan must have a song!"],
          },
        ],
      },
    ],
    price: {
      type: String,
      required: [true, "A subscription plan must have a price!"],
    },
  },
  { timestamps: true }
);

module.exports = model("SubscriptionPlan", subscriptionPlanSchema);
