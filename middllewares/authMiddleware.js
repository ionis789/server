const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(403).json({ message: "User is not authorized" });
    }
    const decodedData = jwt.verify(token, process.env.JWT_KEY);
    req.user = decodedData.id;
    // console.log(decodedData); // example { id: 1, iat: 1711924039, exp: 1712010439 }
    next(); // Continuă fluxul de control către următoarea funcție de middleware sau rută
  } catch (error) {
    return res.status(403).json({ message: "User is not authorized" });
  }
};
