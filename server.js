const logger = require("morgan");
const dotenv = require("dotenv");
const { env } = require("process");

dotenv.config({ path: "./config.env" });

const app = require("./app");

// console.log("env >>>>>>>>>>>>", env);

const runningEnvironment = env.NODE_ENV;

if (runningEnvironment === "development") {
  app.use(logger("dev"));
}

const PORT = env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running in ${runningEnvironment} mode on port ${PORT}`)
);
