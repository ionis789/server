const { Accounts, Users } = require("../models");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator"); // functia ce returneaza erorile(un array) in urma validatiei facuta in authRouter
const jwt = require("jsonwebtoken");
const generateAccessToken = (id) => {
  const JWT_KEY = process.env.JWT_KEY;
  const payload = { id };
  return jwt.sign(payload, JWT_KEY, { expiresIn: "24h" });
};

class authController {
  // req - received data from client
  // res - response for client
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      //validation reg input test
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Error during registration data validation" });
      }

      const { mail, name, password } = req.body;
      // candidate validation by email
      const candidate = await Accounts.findOne({ where: { mail: mail } });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "User with this email already exist" });
      }

      const hashPassword = bcrypt.hashSync(password, 7);
      const newAccount = await Accounts.create({
        mail,
        name,
        password: hashPassword,
      });
      await Users.create({ user_id: newAccount.account_id, user_name: name });
      res.status(200).json({ message: "Successfully registration" });
    } catch (e) {
      res.status(400).json({ message: "Unknown error during registration " });
    }
  }

  async login(req, res) {
    try {
      //logIn validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Error during data validation" });
      }
      const { mail, password } = req.body;
      const candidate = await Accounts.findOne({ where: { mail } });
      if (!candidate) {
        return res.status(400).json({
          message:
            "User with this email doesn't exist, please create account with this email to log In",
        });
      }

      //password validation
      const validPassword = bcrypt.compareSync(password, candidate.password);
      if (!validPassword) {
        return res.status(400).json({
          message: "Password witch is associate to this email is invalid",
        });
      }

      //generate access token
      const token = generateAccessToken(candidate.account_id);
      const oneHour = 3600000;
      res.cookie("accessToken", token, {
        httpOnly: true,
        maxAge: oneHour * 24,
        // sameSite: "None", // Permit trimiterea cookie-ului către origini diferite
        secure: true, // Asigură transmiterea cookie-ului doar prin HTTPS
        // path: "/", // Cookie-ul este valabil pe întregul domeniu
      });
      res.status(200).json({
        loggedUserID: candidate.account_id,
        loggedUserName: candidate.name,
        loggedUserMail: candidate.mail,
        isAuthorized: true,
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Log In error" });
    }
  }
}

module.exports = new authController();
