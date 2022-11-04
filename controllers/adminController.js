const User = require("../models/User");
const Code = require("../models/Code");
const Duration = require("../models/Duration");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const codes = require("../data/codes");
const moment = require("moment");

exports.getUsers = async (req, res) => {
  try {
    let page = req?.query?.page ? +req?.query?.page : 1;
    let perPage = req?.query?.perPage ? +req?.query?.perPage : 10;

    const options = {
      select: "email createdAt code _id",
      sort: { _id: -1 },
      lean: true,
      page: page,
      limit: perPage,
    };
    const user = await User.paginate({}, options);
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send({ msg: "server error!", err });
  }
};

exports.getTrialUsers = async (req, res) => {
  try {
    let page = req?.query?.page ? +req?.query?.page : 1;
    let perPage = req?.query?.perPage ? +req?.query?.perPage : 10;

    const options = {
      select: "email createdAt trial code _id",
      sort: { _id: -1 },
      lean: true,
      page: page,
      limit: perPage,
    };
    const user = await User.paginate({ code: process.env.trialKey }, options);
    // console.log(user);
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send({ msg: "server error!", err });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);
    const user = await User.findByIdAndUpdate(
      id,
      { trial: false },
      { new: true, useFindAndModify: false }
    );

    return res.status(200).json({
      user,
      message: "User Revoke Success!",
    });
  } catch (err) {
    return res.status(500).send({ msg: "server error!", err });
  }
};

exports.createCode = async (req, res) => {
  try {
    const { code } = req.body;

    console.log("code >>>>>>>>", code);

    const existingCode = await Code.findOne({ code });

    if (!code) {
      return res
        .status(400)
        .json({ status: "fail", message: "Code must be filled!" });
    }

    if (existingCode) {
      return res.status(400).json({
        status: "fail",
        message: `${code} code already exist, Try new one!`,
      });
    }

    const newCode = await Code.create(req.body);

    console.log("newCode >>>>>", newCode);

    newCode &&
      res.status(201).json({ status: "success", data: { code: newCode } });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.getAllCodes = async (req, res) => {
  try {
    const codes = await Code.find();
    codes &&
      res
        .status(200)
        .json({ status: "success", results: codes.length, data: { codes } });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.createDuration = async (req, res) => {
  try {
    const { duration } = req.body;

    console.log("duration >>>>>>>>", duration);

    const existingCode = await Duration.findOne({ duration });

    if (!duration) {
      return res
        .status(400)
        .json({ status: "fail", message: "Duration must be filled!" });
    }

    if (existingCode) {
      return res.status(400).json({
        status: "fail",
        message: "Duration already exist, Try new one!",
      });
    }

    const newDuration = await Duration.create(req.body);

    console.log("newDuration >>>>>", newDuration);

    newDuration &&
      res
        .status(201)
        .json({ status: "success", data: { duration: newDuration } });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.getAllDurations = async (req, res) => {
  try {
    const durations = await Duration.find();
    durations &&
      res.status(200).json({
        status: "success",
        results: durations.length,
        data: { durations },
      });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.createSubscription = async (req, res) => {
  console.log("req.body subscription >>>>>>>", req.body);

  try {
    const { code, duration, songDetail, price } = req.body;

    console.log("code >>>>>>>>", code);
    console.log("duration >>>>>>>>", duration);
    console.log("songDetail >>>>>>>>", songDetail);
    console.log("price >>>>>>>>", price);

    if (!code || !duration || !songDetail.length > 0 || !price) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    const existingSubscription = await SubscriptionPlan.findOne({ duration });

    if (existingSubscription) {
      return res.status(400).json({
        status: "fail",
        message: `This subscription already exist, Try new one!`,
      });
    }

    const newSubscriptionPlan = await SubscriptionPlan.create(req.body);

    console.log("newSubscriptionPlan >>>>>", newSubscriptionPlan);

    newSubscriptionPlan &&
      res.status(201).json({
        status: "success",
        data: { subscription: newSubscriptionPlan },
      });
  } catch (error) {
    console.error("error: ", error);
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await SubscriptionPlan.find();

    subscriptions &&
      res.status(200).json({
        status: "success",
        results: subscriptions.length,
        data: { subscriptions },
      });
  } catch (error) {
    console.error("error >>>>>>>>>>>>", error);
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.getSubscriptions = async (req, res) => {
  const { id } = req.params;

  // res.status(200).json({ msg: "Get successfully.", subscription });

  try {
    const subscription = await SubscriptionPlan.findById(id);

    /* const data = await SubscriptionPlan.aggregate([
      {
        $match: {
          _id: subscription._id,
        },
      },
      {
        $lookup: {
          from: "codes",
          localField: "codeID",
          foreignField: "_id",
          as: "codeData",
        },
      },
      // { $unwind: { path: "$codeData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "durations",
          localField: "durationID",
          foreignField: "_id",
          as: "durationData",
        },
      },
      // { $unwind: { path: "$durationData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "albums",
          localField: "albumID",
          foreignField: "id",
          as: "albumData",
        },
      },
      // { $unwind: { path: "$albumData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "songs",
          localField: "songDetail.songIDs",
          foreignField: "_id",
          as: "songsData",
        },
      },
      // { $unwind: { path: "$songsData", preserveNullAndEmptyArrays: true } },
      {
        project: {
          codeData: 1,
          durationData: 1,
          albumData: 1,
          songsData: 1,
        },
      },
    ]);

    console.log("getSubscriptions data >>>>>>>>>>>>>>", data); */
    subscription &&
      res.status(200).json({ status: "success", data: { subscription } });
  } catch (error) {
    console.error("error >>>>>>>>>", error);
    res.status(400).json({ status: "fail", message: error });
  }
};
