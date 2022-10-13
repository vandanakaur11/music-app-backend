const {
  singUpValidation,
  singInValidation,
} = require("../validation/adminValidation");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Albums = require("../models/Album");
const Songs = require("../models/Songs");
const History = require("../models/History");
const codes = require("../data/codes");
const nodemailer = require("nodemailer");
const moment = require("moment");
const { env } = require("process");
const sgMail = require("@sendgrid/mail");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AYA6k3LTstaKtNVcbK4qG7AZNnD9jXdVBEbdZggP2nOAoUGK5pAf1JRF0bmXLynB_qK0RaugfWZh10CO",
  client_secret:
    "EH6HqVMeMBr0dWwsmHpzDZplp6C-I3xzRfatAPieA26__hyLYGopoBu3huoYnxmiFwviyD9C-KZWoApr",
});

sgMail.setApiKey(env.SENDGRID_API_KEY);

// console.log("env >>>>>>>", env);

exports.signUp = async (req, res) => {
  // try {
  //   const { email, password } = req.body;
  //   // Validate fields
  //   if (!email || !password) {
  //     return res
  //       .status(400)
  //       .json({ status: "fail", message: "All fields must be filled!" });
  //   }
  //   // Check existing user
  //   const existingUser = await User.findOne({ email });
  //   if (existingUser) {
  //     return res.status(400).json({
  //       status: "fail",
  //       message: `This email '${email}' is already associated with an account!`,
  //     });
  //   }
  //   // Hash password
  //   const salt = await bcrypt.genSalt(10);
  //   const hashPassword = await bcrypt.hash(password, salt);
  //   const newUser = await User.create({
  //     email,
  //     password: hashPassword,
  //   });
  //   console.log("newUser", newUser);
  //   newUser &&
  //     res.status(201).json({
  //       status: "success",
  //       message: "User created successfully.",
  //       data: {
  //         email: userEmail,
  //       },
  //     });
  //   // if (newUser) {
  //   //   // const verificationLink = `${env.CLIENT_URL}/auth/verify/${newUser._id}/${newUser.hashToken}`;
  //   //   // Send mail via sendgrid
  //   //   /* const mailDetails = {
  //   //     from: env.MAIL_USER, // sender email
  //   //     to: email, // receiver email
  //   //     subject: "Verification Email - IAN Mulder",
  //   //     html: `<h4>Greetings from IAN Mulder,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`,
  //   //   };
  //   //   sendMailViaSendGrid(mailDetails); */
  //   //   // Send mail via nodemailer
  //   //   const mailOptions = {
  //   //     from: env.MAIL_USER, // sender email
  //   //     to: email, // receiver email
  //   //     subject: "Verification Email - IAN Mulder",
  //   //     html: `<h4>Greetings from IAN Mulder,<h4>This access code for trial: "${env.trialKey}"</h4><h4>Please be aware that this access code is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`,
  //   //   };
  //   //   sendMailViaNodeMailer(mailOptions);
  //   //   const { email: userEmail } = newUser;
  //   //   newUser &&
  //   //     res.status(201).json({
  //   //       status: "success",
  //   //       message: "User created successfully.",
  //   //       data: {
  //   //         email: userEmail,
  //   //       },
  //   //     });
  //   // }
  // } catch (error) {
  //   console.log("error >>>>>>>>", error);
  //   res.status(400).json({
  //     status: "fail",
  //     message: error,
  //   });
  // }

  try {
    let { email, password, code } = req.body;

    let trial = false;

    let user;

    if (code === env.trialKey) {
      const exist = await User.findOne({ email });
      if (exist) return res.status(422).send("User Already Exist");
      const hashedPass = await bcrypt.hash(password, 10);
      trial = true;
      user = { ...req.body, trial, password: hashedPass };
    } else if (!codes.includes(code)) {
      return res.status(400).send("Invalid Code: " + code);
    } else if (codes.includes(code)) {
      const codeExists = await User.findOne({ $or: [{ email }, { code }] });
      if (codeExists)
        return res.status(400).send("Sorry, you are not the owner.");
      const hashedPass = await bcrypt.hash(password, 10);
      user = { ...req.body, password: hashedPass };
    }

    const { error } = singUpValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    User.create(user, (err, data) => {
      if (err) return res.status(500).send(err);
      const token = jwt.sign({ id: data._id }, env.JWT_SECRET_KEY);
      if (trial) {
        console.log("data > > > > > > >", data);
        res.status(201).send({ email, token, expiresIn: 3 });
      } else {
        res.status(201).send({ email, token });
      }
    });
  } catch (err) {
    console.log("error >>>>>>>>", error);
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

// exports.verifyUser = async (req, res) => {
//   try {
//     const { email } = req.params;

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

//     const { code } = req.body;

//     if (!code) {
//       return res
//         .status(400)
//         .json({ status: "fail", message: "Code field must be filled!" });
//     }

//     if (code !== existingUser.code) {
//       return res.status(400).json({
//         status: "fail",
//         message: `Invalid ${code}! Check your email`,
//       });
//     }

//     /* const verifiedUser = await User.updateOne(
//       { email },
//       { $set: { trial: "yes", isVerified: true } },
//       { new: true }
//     ); */

//     const verifiedUser = await User.updateOne(
//       { email },
//       { $set: { trial: "yes" } },
//       { new: true }
//     );

//     if (verifiedUser) {
//       const successMessage = `<h4>Your account verified successfully... Now <a href="${env.CLIENT_URL}/auth/login">Login</a> your account</h4><h4>Regards,</h4><h4>IAN Mulder Team</h4>`;

//       // Send mail via sendgrid

//       /* const mailDetails = {
//         from: env.USER_EMAIL, // sender email
//         to: existingUser.email, // receiver email
//         subject: "Verified Account - IAN Mulder",
//         html: successMessage,
//       };

//       sendMailViaSendGrid(mailDetails); */

//       // Send mail via nodemailer

//       const mailOptions = {
//         from: env.USER_EMAIL, // sender email
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
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Check user verified or not
    // if (!existingUser.isVerified) {
    //   // const verificationLink = `${env.CLIENT_URL}/verify/${existingUser._id}/${existingUser.hashToken}`;

    //   // Send mail via sendgrid

    //   /* const mailDetails = {
    //     from: env.USER_EMAIL, // sender email
    //     to: email, // receiver email
    //     subject: "Verification Email - IAN Mulder",
    //     html: `<h4>Greetings from IAN Mulder,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`,
    //   };

    //   sendMailViaSendGrid(mailDetails); */

    //   // Send mail via nodemailer

    //   const mailOptions = {
    //     from: env.MAIL_USER, // sender email
    //     to: email, // receiver email
    //     subject: "Verification Email - IAN Mulder",
    //     html: `<h4>Greetings from IAN Mulder,<h4>This access code for trial: "${env.trialKey}"</h4><h4>Please be aware that this access code is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`,
    //   };

    //   sendMailViaNodeMailer(mailOptions);

    //   return res.status(400).json({
    //     status: "fail",
    //     message:
    //       "Your account not verified!. Check your email for verification.",
    //   });
    // }

    // Verify Password
    const verifyPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    // console.log("userDetail >>>>>>>>", userDetail);

    console.log("verifyPassword >>>>>>>>", verifyPassword);

    if (!verifyPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Incorrect Password!",
      });
    }

    if (!codes.includes(existingUser.code)) {
      // return res.status(401).send("Sorry, you are not the owner.");

      const { error } = singInValidation.validate(req.body);

      if (error) return res.status(400).send(error.details[0].message);

      if (existingUser.code === env.trialKey && existingUser.trial === "no") {
        return res.status(401).json({
          status: "fail",
          message: "Your Trial Period has expired!",
        });
      } else if (
        existingUser.code === env.trialKey &&
        existingUser.trial === "yes"
      ) {
        const token = jwt.sign({ id: existingUser._id }, env.JWT_SECRET_KEY);
        let createdAt = moment(existingUser.createdAt).format("YYYY-MM-DD");
        let current_date = moment().format("YYYY-MM-DD");

        let diff = Math.abs(
          createdAt.split("-")[2] - current_date.split("-")[2]
        );

        let expiresIn = 3 - diff;
        const user = { email, token, expiresIn };

        res.status(200).send(user);
      }
    } else {
      const token = jwt.sign({ id: existingUser._id }, env.JWT_SECRET_KEY);
      const user = { email, token };

      res.status(200).send(user);
    }

    // const userDetail = await User.findOne({ email }).select(
    //   "-password -isVerified -createdAt -updatedAt -__v"
    // );

    // console.log("userDetail>>>>>>>>>>>>", userDetail);

    // if (userDetail && userDetail.code) {
    //   if (!codes.includes(userDetail.code))
    //     return res.status(401).send("Sorry, you are not the owner.");

    //   const { error } = singUpValidation.validate(req.body);

    //   if (error) return res.status(400).send(error.details[0].message);

    //   if (userDetail.code === env.trialKey) {
    //     if (userDetail.trial === "no") {
    //       return res.status(401).send("Your Trial Period has expired!");
    //     } else if (userDetail.trial === "yes") {
    //       // const validPass = await bcrypt.compare(password, userDetail.password);
    //       // if (!validPass) return res.status(401).send("Incorrect Password");

    //       const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);
    //       let createdAt = moment(userDetail.createdAt).format("YYYY-MM-DD");
    //       let current_date = moment().format("YYYY-MM-DD");

    //       let diff = Math.abs(
    //         createdAt.split("-")[2] - current_date.split("-")[2]
    //       );

    //       let expiresIn = 3 - diff;
    //       const user = { email, token, expiresIn };

    //       return res.status(200).send(user);
    //     }
    //   } else if (codes.includes(userDetail.code)) {
    //     const validPass = await bcrypt.compare(password, exist.password);

    //     if (!validPass) return res.status(401).send("Incorrect Password");

    //     const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);

    //     const user = { email, token };

    //     return res.status(200).send(user);
    //   } else {
    //     return res.status(422).send("Sorry, you are not the owner.");
    //   }
    //   // } else {
    //   // const { error } = singInValidation.validate(req.body);

    //   // if (error) return res.status(400).send(error.details[0].message);

    //   // if (userDetail.code === env.trialKey) {
    //   //   if (userDetail.trial === "no") {
    //   //     return res.status(401).send("Your Trial Period has expired!");
    //   //   } else if (userDetail.trial === "yes") {
    //   //     const validPass = await bcrypt.compare(password, userDetail.password);
    //   //     if (!validPass) return res.status(401).send("Incorrect Password");

    //   //     const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);
    //   //     let createdAt = moment(userDetail.createdAt).format("YYYY-MM-DD");
    //   //     let current_date = moment().format("YYYY-MM-DD");

    //   //     let diff = Math.abs(
    //   //       createdAt.split("-")[2] - current_date.split("-")[2]
    //   //     );

    //   //     let expiresIn = 3 - diff;
    //   //     const user = { email, token, expiresIn };

    //   //     return res.status(200).send(user);
    //   //   }
    //   // } else if (codes.includes(userDetail.code)) {
    //   //   const validPass = await bcrypt.compare(password, exist.password);

    //   //   if (!validPass) return res.status(401).send("Incorrect Password");

    //   //   const token = jwt.sign({ id: userDetail._id }, env.JWT_SECRET_KEY);

    //   //   const user = { email, token };

    //   //   return res.status(200).send(user);
    //   // } else {
    //   //   return res.status(422).send("Sorry, you are not the owner.");
    //   // }
    // }

    // res.status(200).json({
    //   status: "success",
    //   data: { user: userDetail, token: generateToken(email) },
    // });
  } catch (err) {
    console.log("err >>>>>>>>", err);

    res.status(400).json({
      status: "fail",
      message: err,
    });
  }

  /* const { password, email, code } = req.body;

  if (code) {
    if (!codes.includes(code))
      return res.status(401).send("Sorry, you are not the owner.");

    const { error } = singUpValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const exist = await User.findOne({ email: email }, { code: code });

    if (exist) {
      // console.log("Exists");
      const hashedPass = await bcrypt.hash(password, 10);
      const update = await User.findOneAndUpdate(
        { email: email, code: code },
        { password: hashedPass }
      );

      console.log("update > > > > > > >", update);

      if (update) return res.status(200).send("Password Changed!");
    } else {
      return res.status(422).send("Sorry, you are not the owner.");
    }
  } else {
    delete req.body.code;

    const { error } = singInValidation.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const exist = await User.findOne({ email });
    console.log("exist > > > > > > >", exist);

    if (exist) {
      if (exist.code === env.trialKey) {
        if (!exist.trial) {
          return res.status(401).send("Your Trial Period has expired!");
        } else {
          const validPass = await bcrypt.compare(password, exist.password);
          if (!validPass) return res.status(401).send("Incorrect Password");

          const token = jwt.sign({ id: exist._id }, env.JWT_SECRET_KEY);
          let createdAt = moment(exist.createdAt).format("YYYY-MM-DD");
          let current_date = moment().format("YYYY-MM-DD");

          let diff = Math.abs(
            createdAt.split("-")[2] - current_date.split("-")[2]
          );

          let expiresIn = 3 - diff;
          const user = { email, token, expiresIn };

          return res.status(200).send(user);
        }
      } else if (codes.includes(exist.code)) {
        const validPass = await bcrypt.compare(password, exist.password);

        if (!validPass) return res.status(401).send("Incorrect Password");

        const token = jwt.sign({ id: exist._id }, env.JWT_SECRET_KEY);

        const user = { email, token };

        return res.status(200).send(user);
      } else {
        return res.status(422).send("Sorry, you are not the owner.");
      }
    } else {
      return res.status(401).send("User Not Found");
    }
  } */
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
      const forgotPassword = `<h4>Greetings from IAN Mulder,</h4><h4>Below is your one time use code:</h4><h4>${resetPasswordCode}</h4><h4>Please be aware that this code is only valid for one hour.</h4><h4>Sincerely,</h4><h4>The IAN Mulder Team</h4>`;

      // Send mail via sendgrid

      /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Forgot Password Verification Code - IAN Mulder",
        html: forgotPassword,
      };
      sendMailViaSendGrid(mailDetails); */

      // Send mail via nodemailer

      const mailOptions = {
        from: env.USER_EMAIL, // sender email
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
  console.log("83", req.userId);

  try {
    // const user = await User.findById(req.userId);
    User.findById(req.userId).then((user) => {
      let fomatted_date = moment(user?.createdAt).format("YYYY-MM-DD");
      let currentDate = moment().startOf("day");
      let start = moment(fomatted_date, "YYYY-MM-DD");
      let end = moment(currentDate, "YYYY-MM-DD");
      let diff = Math.abs(moment.duration(start.diff(end)).asDays());
      //   console.log("diff", diff);
      //     if(diff === 0){

      //     }
      res.status(200).json({ days: diff });
    });
    // return res.status(200).send(user);
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
    return res.status(200).json({
      favourites: user.favourites,
    });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error", error });
  }
};

let subscriptionPrice, redirect_url;

exports.payPayment = (req, res) => {
  // console.log("query >>>>>>>>>>", req.query);

  subscriptionPrice = req.query.price;

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `${env.CLIENT_URL}/payment_success`,
      cancel_url: `${env.CLIENT_URL}/cancel`,
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

const sendMailViaNodeMailer = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.USER_EMAIL,
      pass: env.USER_PASS,
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

// const generateToken = (email, expiresIn) => {
//   return jwt.sign({ email }, env.JWT_SECRET_KEY, { expiresIn });
// };
