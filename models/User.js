const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "A user must have a email address!"],
      maxlength: [100, "The email address cannot exceed 100 characters.!"],
      minlength: [5, "The email address must have at least 5 characters.!"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "A user must have a password!"],
      maxlength: [1024, "The password cannot exceed 1024 characters.!"],
    },
    code: {
      type: String,
      required: [true, "A user must have a code!"],
    },
    trial: {
      type: Boolean,
    },
    resetPasswordVerificationCode: {
      type: String,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      default: "",
    },
    subscriptionEndDate: {
      type: String,
      default: "",
    },
    favourites: [
      {
        type: Schema.Types.ObjectId,
        ref: "song",
        default: [],
      },
    ],
    /* isVerified: {
      type: Boolean,
      default: false,
    }, */
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

module.exports = model("user", userSchema);
