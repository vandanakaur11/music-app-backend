const express = require("express");
const {
  signUp,
  verifyUser,
  signIn,
  getAlbums,
  getSongs,
  addHistory,
  getHistory,
  getExpiringDays,
  handleFavourites,
  getFavourites,
  forgotPassword,
  resetPassword,
  payPayment,
  successPayment,
  findAccount,
  extendSubscription,
} = require("./../controllers/userController");
const checkAuth = require("./../middlewares/check-auth");

const routes = express.Router();

routes.post("/signup", signUp);
// routes.patch("/verify/:email/:hashToken", verifyUser);
routes.post("/signin", signIn);
routes.post("/forgot-password", forgotPassword);
routes.patch("/reset-password/:id", resetPassword);
routes.get("/expiring-days/:email", getExpiringDays);
routes.get("/albums", getAlbums);
routes.get("/history/:user_email", getHistory);
routes.get("/songs/:album_name", getSongs);
routes.post("/history/add", addHistory);
routes.get("/favourites/:id", checkAuth, handleFavourites);
routes.get("/getFavourites", checkAuth, getFavourites);
routes.get("/pay", payPayment);
routes.get("/success", successPayment);
routes.get("/find-account/:email", findAccount);
routes.patch("/extend-subscription/:email", extendSubscription);

module.exports = routes;
