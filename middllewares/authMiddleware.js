const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).json({ message: "User is not authorized" });
    }
    if (authHeader.startsWith("Bearer") && !authHeader.split(" ")[1])
      return res.status(403).json({ message: "User is not authorized" });
    const decodedData = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_KEY,
    );
    req.user = decodedData.id;
    // console.log(decodedData); // example { id: 1, iat: 1711924039, exp: 1712010439 }
    next(); // Continuă fluxul de control către următoarea funcție de middleware sau rută
  } catch (error) {
    return res.status(403).json({ message: "User is not authorized" });
  }
};
