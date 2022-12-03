const {
  singUpValidation,
  singInValidation,
} = require("./../validation/adminValidation");
const bcrypt = require("bcrypt");
const User = require("./../models/User");
const SubscriptionPlan = require("./../models/SubscriptionPlan");
const jwt = require("jsonwebtoken");
const Albums = require("./../models/Album");
const Songs = require("./../models/Songs");
const History = require("./../models/History");
const codes = require("./../data/codes");
const nodemailer = require("nodemailer");
const moment = require("moment");
const { env } = require("process");
const sgMail = require("@sendgrid/mail");
const paypal = require("paypal-rest-sdk");

// console.log("env >>>>>>>>>>>>>", env);

paypal.configure({
  mode: env.PAYPAL_MODE, //sandbox or live
  client_id: env.PAYPAL_CLIENT_ID,
  client_secret: env.PAYPAL_CLIENT_SECRET,
});

sgMail.setApiKey(env.SENDGRID_API_KEY);

// console.log("env >>>>>>>", env);

const CLIENT_URL =
  env.NODE_ENV === "development"
    ? env.CLIENT_LOCAL_URL
    : env.CLIENT_STAGING_URL;

exports.signUp = async (req, res) => {
  try {
    console.log("req.body >>>>>>>>", req.body);

    const { email, password, code } = req.body;

    // Validate fields
    if (!email || !password || !code) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    const { error } = singUpValidation.validate(req.body);
    console.log("error >>>>>>>>>", error);

    if (error)
      return res
        .status(400)
        .json({ status: "fail", message: error.details[0].message });

    // Check existing user
    const existingUser = await User.findOne({ email });
    console.log("existingUser >>>>>>>>>>>", existingUser);

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: `This email '${email}' is already associated with an account!`,
      });
    }

    /* const subscriptions = await SubscriptionPlan.find();
    console.log("subscriptions >>>>>>>>>>>>", subscriptions);

    const subscription = subscriptions?.find(
      (subscription) => subscription.code === code
    );

    console.log("subscription >>>>>>>>", subscription); */

    /* console.log(
      "subscription?.includes(existingUser?.code) >>>>>>>>>>>",
      subscription?.includes(existingUser?.code)
    );

    console.log(
      "!subscription?.includes(existingUser?.code) >>>>>>>>>>>",
      !subscription?.includes(existingUser?.code)
    );

    if (subscription?.includes(existingUser?.code)) {
      return res.status(400).json({
        status: "fail",
        message: "Sorry, you are not the owner",
      });
    } */

    // console.log(
    //   "subscription >>>>>>>>>>>>",
    //   subscription.includes(existingUser.code)
    // );

    /* if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Sorry, you are not the owner",
      });
    } */

    // Get subscription data by code
    const subscription = await SubscriptionPlan.findOne({ code });
    console.log("subscription >>>>>>>>>>>", subscription);

    if (!subscription) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid Subscription Code! Enter Correct One.",
      });
    }

    // add next day base on duration day
    const endDate = new Date();
    endDate.setDate(new Date().getDate() + subscription.duration);
    console.log("endDate >>>>>>>>", endDate.toISOString());

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // let trial;

    // let user;

    // console.log(
    //   `code.toLowerCase() === env.trialKey >>>>>>>>>>>`,
    //   code.toLowerCase() === env.trialKey
    // );

    // if (code.toLowerCase() === env.trialKey) {
    //   trial = true;

    //   user = {
    //     email,
    //     password: hashPassword,
    //     code,
    //     trial,
    //     subscription: subscription._id,
    //     subscriptionEndDate: endDate,
    //   };
    // } else {
    //   user = {
    //     email,
    //     password: hashPassword,
    //     code,
    //     trial,
    //     subscription: subscription._id,
    //     subscriptionEndDate: endDate,
    //   };
    // }

    // } else if (codes.includes(code)) {
    //   const codeExists = await User.findOne({ $or: [{ email }, { code }] });

    //   if (codeExists)
    //     return res.status(400).send("Sorry, you are not the owner.");

    //   user = {
    //     email,
    //     password: hashPassword,
    //     code,
    //     subscription: subscription._id,
    //     subscriptionEndDate: endDate,
    //   };
    // }

    const newUser = await User.create({
      email,
      password: hashPassword,
      code,
      trial: true,
      subscription: subscription._id,
      subscriptionEndDate: endDate,
    });

    console.log("newUser >>>>>>>>>", newUser);

    newUser &&
      res
        .status(201)
        .json({ status: "success", message: "User created successfully." });

    // User.create(user, (err, data) => {
    //   if (err) return res.status(400).send(err);

    //   const token = jwt.sign({ id: data._id }, env.JWT_SECRET_KEY);

    //   if (trial) {
    //     console.log("data > > > > > > >", data);

    //     /* const verificationLink = `${CLIENT_URL}/verify/${data._id}/${data.hashToken}`;

    //     // Send mail via nodemailer
    //     const verificationMessage = `Greetings from IAN Mulder, Below is your one time use verify link: <br /><br />Click here for verification <a href="${verificationLink}">link</a><br /><br />Please be aware that this verification link is only valid for 1 day.<br />If we can provide you any assistance, please reply to this email.<br />Yours,Mulder Music Streaming team`;

    //     const mailOptions = {
    //       from: env.WEBMAIL_SMTP_USER, // sender email
    //       to: email, // receiver email
    //       subject: "Verification Email - IAN Mulder",
    //       html: verificationMessage,
    //     };

    //     sendMailViaNodeMailer(mailOptions); */

    //     res.status(201).send({ email, token, expiresIn: endDate });
    //   } else {
    //     console.log("data > > > > > > >", data);

    //     /* const verificationLink = `${CLIENT_URL}/verify/${data._id}/${data.hashToken}`;

    //     // Send mail via nodemailer

    //     // const verificationLink = `<h4>Greetings from IAN Mulder,<h4>This access code for trial: "${env.trialKey}"</h4><h4>Please be aware that this access code is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`;
    //     const verificationMessage = `Greetings from IAN Mulder, Below is your one time use verify link: Click here for verification <a href="${verificationLink}">link</a>Please be aware that this verification link is only valid for 1 day.<br />If we can provide you any assistance, please reply to this email.<br />Yours,Mulder Music Streaming team`;

    //     const mailOptions = {
    //       from: env.WEBMAIL_SMTP_USER, // sender email
    //       to: email, // receiver email
    //       subject: "Verification Email - IAN Mulder",
    //       html: verificationMessage,
    //     };

    //     sendMailViaNodeMailer(mailOptions); */

    //     res.status(201).send({ email, token, expiresIn: 365 });
    //   }
    // });
  } catch (err) {
    console.log("err >>>>>>>>", err);

    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

// exports.verifyUser = async (req, res) => {
//   try {
//     console.log("req.params >>>>>>>", req.params);

//     const { email, hashToken } = req.params;

//     // Check user exist or not
//     const existingUser = await User.findOne({ email });

//     if (!existingUser) {
//       return res
//         .status(400)
//         .json({ status: "fail", message: "User not found!" });
//     }

//     if (existingUser.isVerified) {
//       return res.status(400).json({
//         status: "fail",
//         message: "User already verified, Now login!",
//       });
//     }

//     if (hashToken !== existingUser.hashToken) {
//       return res.status(400).json({
//         status: "fail",
//         message: `Invalid link! Check your email`,
//       });
//     }

//     const verifiedUser = await User.updateOne(
//       { email },
//       { $set: { hashToken: "", isVerified: true } },
//       { new: true, runValidators: true }
//     );

//     if (verifiedUser) {
//       // Send mail via sendgrid

//       /* const mailDetails = {
//         from: env.WEBMAIL_SMTP_USER, // sender email
//         to: existingUser.email, // receiver email
//         subject: "Verified Account - IAN Mulder",
//         html: successMessage,
//       };

//       sendMailViaSendGrid(mailDetails); */

//       // Send mail via nodemailer

//       const successMessage = `Dear sir/madam,<br />Congratulations on your sign up to enjoy pianist Ian Mulder’s music albums! We would like to highlight a few features for you:<br />- Lyrics. Click the “show lyrics” button, when applicable, to follow the lyrics that are being expressed instrumentally.- Playlist. Save your favorite tracks to your Playlist to listen to them later.- 20 albums. Enjoy Mulder’s life work and listen to each solo album!<br />If we can provide you any assistance, please reply to this email.<br />Yours,Mulder Music Streaming team`;

//       const mailOptions = {
//         from: env.WEBMAIL_SMTP_USER, // sender email
//         to: existingUser.email, // receiver email
//         subject: "Verified Account - IAN Mulder",
//         html: successMessage,
//       };

//       sendMailViaNodeMailer(mailOptions);

//       return res.status(200).json({
//         status: "success",
//         message: "Account verified successfully, Now login...",
//       });
//     }

//     res.status(400).json({ status: "fail", message: "Something went wrong!" });
//   } catch (error) {
//     console.log("error >>>>>>>>", error);

//     res.status(400).json({
//       status: "fail",
//       message: error,
//     });
//   }
// };

// exports.signIn = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate fields
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ status: "fail", message: "All fields must be filled!" });
//     }

//     // Check existing user
//     const existingUser = await User.findOne({ email })
//       .select("-createdAt -updatedAt -__v")
//       .populate("subscription", "-price -createdAt -updatedAt -__v");

//     console.log("existingUser >>>>>>>>>>>>", existingUser);

//     if (!existingUser) {
//       return res.status(400).json({
//         status: "fail",
//         message: "User not found!",
//       });
//     }

//     // Verify Password
//     const verifyPassword = await bcrypt.compare(
//       password,
//       existingUser.password
//     );

//     // console.log("userDetail >>>>>>>>", userDetail);

//     console.log("verifyPassword >>>>>>>>", verifyPassword);

//     if (!verifyPassword) {
//       return res.status(400).json({
//         status: "fail",
//         message: "Incorrect Password!",
//       });
//     }

//     console.log(
//       "codes.includes(existingUser.code) >>>>>>>>>>>>>>",
//       codes.includes(existingUser.code)
//     );

//     console.log(
//       "!codes.includes(existingUser.code) >>>>>>>>>>>>>>",
//       !codes.includes(existingUser.code)
//     );

//     console.log("existingUser.code >>>>>>>>>>>>>>", existingUser.code);

//     console.log(
//       "existingUser.code === env.trialKey >>>>>>>>>>>>>>",
//       existingUser.code === env.trialKey
//     );

//     console.log(
//       "existingUser.trial === false >>>>>>>>>>>>>>",
//       existingUser.trial === false
//     );

//     console.log(
//       "existingUser.code === env.trialKey && existingUser.trial === false >>>>>>>>>>>>>>",
//       existingUser.code === env.trialKey && existingUser.trial === false
//     );

//     console.log(
//       "existingUser.trial === true >>>>>>>>>>>>>>",
//       existingUser.trial === true
//     );

//     if (existingUser.code === undefined) {
//       console.log("existingUser >>>>>>>>>>>>>>>", existingUser);

//       const { favourites, subscriptionEndDate, _id, email, subscription } =
//         existingUser;

//       const token = jwt.sign({ id: _id }, env.JWT_SECRET_KEY);

//       const userFilteredData = Object.assign({
//         favourites,
//         subscriptionEndDate,
//         _id,
//         email,
//         subscription,
//       });

//       console.log("userFilteredData >>>>>>>>>>>>>", userFilteredData);

//       res
//         .status(200)
//         .json({ status: "success", data: { user: userFilteredData }, token });
//     } else {
//       if (!codes.includes(existingUser.code)) {
//         // return res.status(401).send("Sorry, you are not the owner.");

//         const { error } = singInValidation.validate(req.body);

//         if (error) return res.status(400).send(error.details[0].message);

//         if (existingUser.code === "ldtrial" && existingUser.trial === false) {
//           return res.status(401).json({
//             status: "fail",
//             message: "Your Trial Period has expired!",
//           });
//         } else if (
//           existingUser.code === env.trialKey &&
//           existingUser.trial === true
//         ) {
//           const token = jwt.sign({ id: existingUser._id }, env.JWT_SECRET_KEY);

//           let createdAt = moment(existingUser.createdAt).format("YYYY-MM-DD");
//           let current_date = moment().format("YYYY-MM-DD");

//           let diff = Math.abs(
//             createdAt.split("-")[2] - current_date.split("-")[2]
//           );

//           let expiresIn = 3 - diff;
//           const user = { email, token, expiresIn };

//           res.status(200).send(user);
//         }
//       } else {
//         const token = jwt.sign({ id: existingUser._id }, env.JWT_SECRET_KEY);

//         const user = {
//           email,
//           token,
//           data: {
//             user: { email, subscriptionID: "635bd8fdcb397b3a044d9867" },
//           },
//         };

//         res.status(200).send(user);
//       }

//       // const userDetail = await User.findOne({ email }).select(
//       //   "-password -isVerified -createdAt -updatedAt -__v"
//       // );

//       // console.log("userDetail>>>>>>>>>>>>", userDetail);

//       // if (userDetail && userDetail.code) {
//       //   if (!codes.includes(userDetail.code))
//       //     return res.status(401).send("Sorry, you are not the owner.");

//       //   const { error } = singUpValidation.validate(req.body);

//       //   if (error) return res.status(400).send(error.details[0].message);

//       //   if (userDetail.code === env.trialKey) {
//       //     if (userDetail.trial === "no") {
//       //       return res.status(401).send("Your Trial Period has expired!");
//       //     } else if (userDetail.trial === "yes") {
//       //       // const validPass = await bcrypt.compare(password, userDetail.password);
//       //       // if (!validPass) return res.status(401).send("Incorrect Password");

//       //       const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);

//       //       let createdAt = moment(userDetail.createdAt).format("YYYY-MM-DD");
//       //       let current_date = moment().format("YYYY-MM-DD");

//       //       let diff = Math.abs(
//       //         createdAt.split("-")[2] - current_date.split("-")[2]
//       //       );

//       //       let expiresIn = 3 - diff;
//       //       const user = { email, token, expiresIn };

//       //       return res.status(200).send(user);
//       //     }
//       //   } else if (codes.includes(userDetail.code)) {
//       //     const validPass = await bcrypt.compare(password, exist.password);
//       //     if (!validPass) return res.status(401).send("Incorrect Password");

//       //     const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);

//       //     const user = { email, token };

//       //     return res.status(200).send(user);
//       //   } else {
//       //     return res.status(422).send("Sorry, you are not the owner.");
//       //   }

//       //   // } else {
//       //   // const { error } = singInValidation.validate(req.body);
//       //   // if (error) return res.status(400).send(error.details[0].message);
//       //   // if (userDetail.code === env.trialKey) {
//       //   //   if (userDetail.trial === "no") {
//       //   //     return res.status(401).send("Your Trial Period has expired!");
//       //   //   } else if (userDetail.trial === "yes") {
//       //   //     const validPass = await bcrypt.compare(password, userDetail.password);
//       //   //     if (!validPass) return res.status(401).send("Incorrect Password");
//       //   //     const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);
//       //   //     let createdAt = moment(userDetail.createdAt).format("YYYY-MM-DD");
//       //   //     let current_date = moment().format("YYYY-MM-DD");
//       //   //     let diff = Math.abs(
//       //   //       createdAt.split("-")[2] - current_date.split("-")[2]
//       //   //     );
//       //   //     let expiresIn = 3 - diff;
//       //   //     const user = { email, token, expiresIn };
//       //   //     return res.status(200).send(user);
//       //   //   }
//       //   // } else if (codes.includes(userDetail.code)) {
//       //   //   const validPass = await bcrypt.compare(password, exist.password);
//       //   //   if (!validPass) return res.status(401).send("Incorrect Password");
//       //   //   const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);
//       //   //   const user = { email, token };
//       //   //   return res.status(200).send(user);
//       //   // } else {
//       //   //   return res.status(422).send("Sorry, you are not the owner.");
//       //   // }
//       // }

//       // res.status(200).json({
//       //   status: "success",
//       //   data: { user: userDetail, token: generateToken(email) },
//       // });
//     }
//   } catch (err) {
//     console.log("err >>>>>>>>", err);

//     res.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }

//   /* const { password, email, code } = req.body;

//   if (code) {
//     if (!codes.includes(code))
//       return res.status(401).send("Sorry, you are not the owner.");

//     const { error } = singUpValidation.validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     const exist = await User.findOne({ email: email }, { code: code });

//     if (exist) {
//       // console.log("Exists");
//       const hashedPass = await bcrypt.hash(password, 10);
//       const update = await User.findOneAndUpdate(
//         { email: email, code: code },
//         { password: hashedPass }
//       );

//       console.log("update > > > > > > >", update);

//       if (update) return res.status(200).send("Password Changed!");
//     } else {
//       return res.status(422).send("Sorry, you are not the owner.");
//     }
//   } else {
//     delete req.body.code;

//     const { error } = singInValidation.validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     const exist = await User.findOne({ email });
//     console.log("exist > > > > > > >", exist);

//     if (exist) {
//       if (exist.code === env.trialKey) {
//         if (!exist.trial) {
//           return res.status(401).send("Your Trial Period has expired!");
//         } else {
//           const validPass = await bcrypt.compare(password, exist.password);
//           if (!validPass) return res.status(401).send("Incorrect Password");

//           const token = jwt.sign({ id: exist._id }, env.JWT_SECRET_KEY);
//           let createdAt = moment(exist.createdAt).format("YYYY-MM-DD");
//           let current_date = moment().format("YYYY-MM-DD");

//           let diff = Math.abs(
//             createdAt.split("-")[2] - current_date.split("-")[2]
//           );

//           let expiresIn = 3 - diff;
//           const user = { email, token, expiresIn };

//           return res.status(200).send(user);
//         }
//       } else if (codes.includes(exist.code)) {
//         const validPass = await bcrypt.compare(password, exist.password);

//         if (!validPass) return res.status(401).send("Incorrect Password");

//         const token = jwt.sign({ id: exist._id }, env.JWT_SECRET_KEY);

//         const user = { email, token };

//         return res.status(200).send(user);
//       } else {
//         return res.status(422).send("Sorry, you are not the owner.");
//       }
//     } else {
//       return res.status(401).send("User not found!");
//     }
//   } */
// };

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email })
      .select("-createdAt -updatedAt -__v")
      .populate("subscription", "-price -createdAt -updatedAt -__v");

    console.log("existingUser >>>>>>>>>>>>", existingUser);

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Verify Password
    const verifyPassword = await bcrypt.compare(
      password,
      existingUser?.password
    );

    console.log("verifyPassword >>>>>>>>", verifyPassword);

    if (!verifyPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Incorrect Password!",
      });
    }

    const { error } = singInValidation.validate(req.body);
    console.log("error >>>>>>>>>", error);
    if (error) return res.status(400).send(error.details[0].message);

    // if (
    //   existingUser?.code?.toLowerCase() === env.trialKey &&
    //   existingUser?.trial === false
    // ) {

    // console.log(
    //   "existingUser?.subscription?._id >>>>>>>>>",
    //   existingUser?.subscription?._id
    // );

    if (
      existingUser?.trial === false &&
      existingUser?.subscription?._id !== ""
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Your trial period has been expired!",
        data: {
          user: existingUser?.email,
        },
      });
    } else {
      const token = jwt.sign({ id: existingUser?._id }, env.JWT_SECRET_KEY);
      const user = {
        email,
        token,
        subscriptionID: existingUser?.subscription?._id,
        trial: existingUser?.trial,
      };

      res.status(200).json({ status: "success", data: { user } });
    }
  } catch (err) {
    console.log("err >>>>>>>>", err);

    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.findAccount = async (req, res) => {
  try {
    // Check existing user
    const existingUser = await User.findOne({ email: req.params.email });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    existingUser &&
      res.status(200).json({
        status: "success",
        data: {
          user: {
            _id: existingUser._id,
            email: existingUser.email,
            subscriptionID: existingUser.subscriptionID,
            subscriptionEndDate: existingUser.subscriptionEndDate,
          },
        },
      });
  } catch (err) {
    console.error("findAccount error >>>>>>>>>>", err);
  }
};

exports.extendSubscription = async (req, res) => {
  try {
    const { email } = req.params;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    const { code } = req.body;

    // Validate fields
    if (!code) {
      return res
        .status(400)
        .json({ status: "fail", message: "Code field must be filled!" });
    }

    // Get all subscription data
    const subscriptions = await SubscriptionPlan.find();
    console.log("subscriptions >>>>>>>>>>>", subscriptions);

    const subscriptionCodes = subscriptions?.map(
      (subscription) => subscription.code
    );
    console.log("subscriptionCodes >>>>>>>>>>", subscriptionCodes);

    if (!subscriptionCodes.includes(code)) {
      return res.status(400).json({
        status: "success",
        message: "Invalid Subscription Code! Enter Correct One.",
      });
    }

    // Get subscription data by code
    const subscription = subscriptions.find(
      (subscription) => subscription.code === code
    );
    console.log("subscription >>>>>>>>>>>", subscription);

    // add next day base on duration day
    const endDate = new Date();
    endDate.setDate(new Date().getDate() + subscription.duration);
    console.log("endDate >>>>>>>>", endDate.toISOString());

    const updatedSubscription = await User.updateOne(
      { email },
      {
        $set: {
          code,
          subscription: subscription._id,
          subscriptionEndDate: endDate,
        },
      },
      { new: true, runValidators: true }
    );

    updatedSubscription &&
      res.status(200).json({
        status: "success",
        message: `Your subscription has been upgraded successfully...`,
      });
  } catch (err) {
    console.error("extendSubscriptionForOneYear err", err);
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const updatedSubscription = await User.updateOne(
      { email: req.params.body },
      { subscriptionEndDate: req.params.subscriptionEndDate },
      { new: true, runValidators: true }
    );
  } catch (err) {
    console.error("updateSubscription err", err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    console.log("existingUser >>>>>>>>>", existingUser);

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Validate fields
    if (!email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email field must be filled!" });
    }

    const { _id, email: userEmail } = existingUser;

    let chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let resetPasswordCode = "";
    let length = 10;

    for (var i = length; i > 0; --i) {
      resetPasswordCode +=
        chars[Math.floor(Math.random() * chars.length)].toUpperCase();
    }

    const updateCode = await User.updateOne(
      { _id },
      { $set: { resetPasswordVerificationCode: resetPasswordCode } }
    );

    if (updateCode) {
      // const forgotPassword = `<h4>Greetings from IAN Mulder,</h4><h4>Below is your one time use code:</h4><h4>${resetPasswordCode}</h4><h4>Please be aware that this code is only valid for one hour.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`;
      const forgotPassword = `Dear sir/madam,<br /><br />The verification code to reset your password is below. It is valid for 1 hour. You can copy and paste this verification code on the <q><b>forgot password</b></q> page now and set your new password.<br />Code: <b>${resetPasswordCode}</b><br />If we can provide you any assistance, please reply to this email.<br />Yours,Mulder Music Streaming team`;

      // Send mail via sendgrid

      /* const mailDetails = {
        from: env.WEBMAIL_SMTP_USER, // sender email
        to: email, // receiver email
        subject: "Forgot Password Verification Code - IAN Mulder",
        html: forgotPassword,
      };
      sendMailViaSendGrid(mailDetails); */

      // Send mail via nodemailer

      const mailOptions = {
        from: env.WEBMAIL_SMTP_USER, // sender email
        to: email, // receiver email
        subject: "Forgot Password Verification Code - IAN Mulder",
        html: forgotPassword,
      };

      sendMailViaNodeMailer(mailOptions);

      res.status(200).json({
        status: "success",
        message: `Success! verification code sent to '${userEmail}' email.`,
        data: {
          id: _id,
        },
      });
    }
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const { password, resetPasswordVerificationCode } = req.body;

    // Check user exist or not
    const existingUser = await User.findOne({ _id: id });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Validate fields
    if (!password || !resetPasswordVerificationCode) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    if (
      resetPasswordVerificationCode !==
      existingUser.resetPasswordVerificationCode
    ) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid code!, Check your email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const result = await User.updateOne(
      { _id: id },
      { $set: { password: hashPassword, resetPasswordVerificationCode: "" } }
    );

    if (result) {
      return res.status(200).json({
        status: "success",
        message: "Password updated successfully. Now login...",
      });
    }

    res.status(400).json({
      status: "fail",
      message: "Something went wrong!",
    });
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getExpiringDays = async (req, res) => {
  // console.log("83", req.params.email);

  console.log("req.params", req.params);
  console.log("req?.params?.email", req.params.email);

  try {
    const loggedInUser = await User.findOne({ email: req.params.email });

    console.log("loggedInUser >>>>>>>>>", loggedInUser);

    if (loggedInUser) {
      if (
        loggedInUser?.trial === false &&
        loggedInUser?.subscriptionEndDate === ""
      ) {
        return res.status(400).json({
          status: "fail",
          message: "Your trial period has been expired!",
          data: {
            user: loggedInUser?.email,
          },
        });
      }

      let fomatted_date = moment(loggedInUser?.subscriptionEndDate).format(
        "YYYY-MM-DD"
      );
      let currentDate = moment().startOf("day");
      let start = moment(fomatted_date, "YYYY-MM-DD");
      let end = moment(currentDate, "YYYY-MM-DD");
      let diff = Math.abs(moment.duration(start.diff(end)).asDays());

      console.log("diff >>>>>>>>>>>>>", diff);

      if (diff === 0) {
        loggedInUser.trial = false;
        loggedInUser.subscriptionEndDate = "";
      }

      res.status(200).json({ status: "success", data: { days: diff } });
    }

    /* User.findOne({ email: req.params.email }).then((user) => {
      console.log("user >>>>>>>>>", user);

      if (user?.subscriptionEndDate === "") {
        return res.status(400).json({
          status: "fail",
          message: "Your subscription has been expired!",
        });
      }

      let fomatted_date = moment(user?.subscriptionEndDate).format(
        "YYYY-MM-DD"
      );
      let currentDate = moment().startOf("day");
      let start = moment(fomatted_date, "YYYY-MM-DD");
      let end = moment(currentDate, "YYYY-MM-DD");
      let diff = Math.abs(moment.duration(start.diff(end)).asDays());

      console.log("diff", diff);

      if (diff === 0) {
        user["subscriptionEndDate"] = "";
      }

      res.status(200).json({ status: "success", data: { days: diff } });
    }); */
  } catch (err) {
    return res.status(500).send({ msg: "Not Found!", err });
  }
};

exports.getAlbums = async (req, res) => {
  try {
    const albums = await Albums.find().sort({ _id: -1 });
    return res.status(200).send(albums);
  } catch (err) {
    return res.status(500).send({ msg: "Not Found!", err });
  }
};

exports.getSongs = async (req, res) => {
  const { album_name } = req.params;
  // const domainHost = `${req.protocol}://${req.get("host")}/`;
  try {
    const songs = await Songs.find({ Album_Name: album_name }).sort({
      _id: 1,
    });

    if (songs.length > 0) {
      const album = await Albums.findOne({ _id: songs[0].Album_id });
      return res.status(200).send([songs, album]);
    }

    return res.status(200).send([songs]);
  } catch (err) {
    return res.status(500).send({ msg: "Not Found!", err });
  }
};

exports.addHistory = async (req, res) => {
  const { songName, albumName, userEmail, createdAt } = req.body;

  if (songName && albumName && userEmail && createdAt) {
    const history = { songName, albumName, userEmail, createdAt };

    History.create(history, (err, data) => {
      if (err) return res.status(401).send(err);
      return res.status(201).send({ data });
    });
  }

  // const { album_name } = req.params;
  // const domainHost = `${req.protocol}://${req.get("host")}/`;
  // try {
  //     const songs = await Songs.find({ Album_Name: album_name });
  //     if (songs.length > 0) {
  //         const album = await Albums.findOne({ _id: songs[0].Album_id });
  //         return res.status(200).send([songs, album]);
  //     }
  //     return res.status(200).send([songs]);
  // } catch (err) {
  //     return res.status(500).send({ msg: "Not Found!", err });
  // }
};

exports.getHistory = async (req, res) => {
  const { user_email } = req.params;

  // const domainHost = `${req.protocol}://${req.get("host")}/`;

  try {
    const history = await History.find({ userEmail: user_email })
      .sort({ _id: -1 })
      .limit(20);
    // if (history.length > 0) {
    //     const album = await Albums.findOne({ _id: songs[0].Album_id });
    //     return res.status(200).send([songs, album]);
    // }

    return res.status(200).send([history]);
  } catch (err) {
    return res.status(500).send({ msg: "Not Found!", err });
  }
};

exports.checkUserAvailability = async (userMail) => {
  try {
    return await History.findOne({ userEmail: userMail }).sort({ _id: -1 });
  } catch (err) {
    return null;
  }
};

exports.getUsers = async () => {
  try {
    return await History.find({}).distinct("userEmail");
  } catch (err) {
    return null;
  }
};

exports.handleFavourites = async (req, res) => {
  try {
    const { id } = req.params;
    const exist = await User.findById(req.userId);
    let user;

    if (exist.favourites.includes(id)) {
      user = await User.findByIdAndUpdate(
        req.userId,
        {
          $pull: { favourites: id },
        },
        { new: true, useFindAndModify: false }
      ).populate("favourites");

      return res.status(200).json({
        favourites: user?.favourites,
        message: "Removed From Favourites!",
      });
    }

    user = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: { favourites: id },
      },
      { new: true, useFindAndModify: false }
    ).populate("favourites");

    return res.status(200).json({
      favourites: user?.favourites,
      message: "Added To Favourites!",
    });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error", error });
  }
};

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favourites");

    console.log("getFavourites user >>>>>>>>>>>>>>", user);

    return res.status(200).json({
      favourites: user.favourites,
    });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error", error });
  }
};

let subscriptionPrice, redirect_url;

exports.payPayment = (req, res) => {
  console.log("query >>>>>>>>>>", req.query);

  subscriptionPrice = req.query.price;

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `${CLIENT_URL}/payment_success`,
      cancel_url: `${CLIENT_URL}/cancel`,
    },
    transactions: [
      {
        amount: {
          currency: "USD",
          total: subscriptionPrice,
        },
        description: "This is the payment description.",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      payment = payment.links.filter((data) => data.rel === "approval_url")[0];
      console.log("payment >>>>>>>>>>>>", payment);
      console.log("payment.href >>>>>>>>>>>", payment.href);
      redirect_url = payment.href;
      res.json({ link: redirect_url });
    }
  });
};

exports.successPayment = (req, res) => {
  console.log("req.query", req.query);

  const { paymentId, PayerID } = req.query;

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: subscriptionPrice,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log("error.response >>>>>>>>>>>>>", error.response);
        throw error;
      } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        res.send(JSON.stringify(payment));
      }
    }
  );
};

exports.availSubscription = async (req, res) => {
  try {
    const {
      email,
      subscriptionID,
      subscriptionStartDate,
      subscriptionEndDate,
    } = req.body;

    // Validate fields
    if (
      !email ||
      !subscriptionID ||
      !subscriptionStartDate ||
      !subscriptionEndDate
    ) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.accessCodeForSubscription = async (req, res) => {
  try {
    let chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let accessCode = "";
    let length = 10;

    for (var i = length; i > 0; --i) {
      accessCode +=
        chars[Math.floor(Math.random() * chars.length)].toUpperCase();
    }
  } catch (err) {
    return null;
  }
};

const sendMailViaSendGrid = async (mailDetails) => {
  try {
    await sgMail
      .send(mailDetails)
      .then(() => {
        console.log("Mail sent successfully!");
      })
      .catch((err) => {
        console.error("sendMailViaSendGrid err >>>>>>>>>>>>>>>>>>", err);
      });
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};

/* console.log("SMTP Info >>>>>>>>>>>>", {
  WEBMAIL_SMTP_HOST: env.WEBMAIL_SMTP_HOST,
  WEBMAIL_SMTP_PORT: Number(env.WEBMAIL_SMTP_PORT),
  WEBMAIL_SMTP_SECURE: Boolean(env.WEBMAIL_SMTP_SECURE),
  WEBMAIL_SMTP_USER: env.WEBMAIL_SMTP_USER,
  WEBMAIL_SMTP_PASS: env.WEBMAIL_SMTP_PASS,
}); */

const sendMailViaNodeMailer = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    host: env.WEBMAIL_SMTP_HOST,
    port: env.WEBMAIL_SMTP_PORT,
    secure: env.WEBMAIL_SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: env.WEBMAIL_SMTP_USER,
      pass: env.WEBMAIL_SMTP_PASS,
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("sendMailViaNodeMailer error >>>>>>>>>>>>>", error);
    } else {
      console.log("info >>>>>>", info);
      console.info("Email sent: " + info.response);
    }
  });
};

const generateToken = (email) => {
  return jwt.sign({ email }, env.JWT_SECRET_KEY, {
    expiresIn: "1h", // expires in 1h
  });
};
