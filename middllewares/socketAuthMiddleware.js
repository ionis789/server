const jwt = require("jsonwebtoken");

module.exports = (accessToken) => {
  const token = accessToken;
  if (!token) {
    return { message: "User is not authorized", status: 403 };
  }
  const decodedData = jwt.verify(token, process.env.JWT_KEY);
  return decodedData.id;
};
