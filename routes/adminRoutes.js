const express = require("express");
const {
  getUsers,
  getTrialUsers,
  revokeAccess,
  createCode,
  createDuration,
  createSubscription,
  getAllCodes,
  getAllDurations,
  getAllSubscriptions,
  getSubscriptions,
} = require("../controllers/adminController");

const checkAuth = require("../middlewares/check-auth");

const routes = express.Router();

routes.get("/users", getUsers);
routes.get("/trial-users", getTrialUsers);
routes.get("/revoke", revokeAccess);
routes.route("/codes").post(createCode).get(getAllCodes);
routes.route("/durations").post(createDuration).get(getAllDurations);
routes
  .route("/subscriptions")
  .post(createSubscription)
  .get(getAllSubscriptions);
routes.route("/subscriptions/:id").get(getSubscriptions);
/* routes.get("/codes", (req, res) => {
  res.send("haan hai");
}); */

module.exports = routes;
