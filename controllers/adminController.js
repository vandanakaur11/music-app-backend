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
    codes && res.status(200).json({ status: "success", data: { codes } });
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
        message: `${duration} duration already exist, Try new one!`,
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
      res.status(200).json({ status: "success", data: { durations } });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.createSubscription = async (req, res) => {
  console.log("req.body subscription >>>>>>>", req.body);

  try {
    const { codeID, durationID, songDetail, price } = req.body;

    console.log("codeID >>>>>>>>", codeID);
    console.log("durationID >>>>>>>>", durationID);
    console.log("songDetail >>>>>>>>", songDetail);
    console.log("price >>>>>>>>", price);

    const existingSubscription = await SubscriptionPlan.findOne({ codeID });

    if (!codeID || !durationID || !songDetail.length > 0 || !price) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

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
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await SubscriptionPlan.find();

    subscriptions &&
      res.status(200).json({ status: "success", data: { subscriptions } });
  } catch (error) {
    console.error("error >>>>>>>>>>>>", error);
    res.status(400).json({ status: "fail", message: error });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscription = await SubscriptionPlan.findById(req.params.id);

    /* const data = await SubscriptionPlan.aggregate([
      {
        $match: {
          _id: subscription._id,
        },
      },
      {
        $lookup: {
          from: "Code",
          localField: "codeID",
          foreignField: "_id",
          as: "CodeData",
        },
      },
      {
        $unwind: "$Code",
      },
      {
        $lookup: {
          from: "Duration",
          localField: "durationID",
          foreignField: "_id",
          as: "DurationData",
        },
      },
      {
        $unwind: "$Duration",
      },
      {
        $lookup: {
          from: "Album",
          localField: "albumID",
          foreignField: "id",
          as: "AlbumData",
        },
      },
      {
        $unwind: "$Album",
      },
      {
        $lookup: {
          from: "Song",
          localField: "songIDs",
          foreignField: "_id",
          as: "SongsData",
        },
      },
      {
        $unwind: "$Song",
      },
      {
        $project: {
          "CodeData.code": 1,
          "DurationData.duration": 1,
          "AlbumData.Album_Name": 1,
          "SongsData.Song_Name": 1,
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
