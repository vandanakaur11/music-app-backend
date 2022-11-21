const { connect, connection } = require("mongoose");

module.exports = async function connectDB(params) {
  connect(process.env.DB_CONNECT, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection
    .once("open", () => {
      console.log("Database Connected");
    })
    .catch((err) => {
      console.log({ err });
    });
};
