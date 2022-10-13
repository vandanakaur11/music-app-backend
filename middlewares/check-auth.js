const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token = await req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).send("Not Verified");

  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!verifyToken) return res.status(400).send("Authentication Failed");
    req.userId = verifyToken.id;
  } catch (err) {
    return res.status(400).send("Authentication Failed");
  }
  next();
};
