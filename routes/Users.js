const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const authMiddleware = require("../middllewares/authMiddleware");
const { Op } = require("sequelize");
router.get("/", authMiddleware, async (req, res) => {
  const updatedDB = await Users.findAll();
  res.json(updatedDB);
});

router.post("/", authMiddleware, async (req, res) => {
  const loggedUser = req.user; // id-ul utilizatorului logat extras din access token care o trimis request la cautarea altor utilizatori
  const searchText = req.body.searchText;
  const avoidUsers = req.body.avoidUsers; // array of names
  try {
    if (searchText) {
      const matchedUsers = await Users.findAll({
        where: {
          user_name: { [Op.like]: `%${searchText}%`, [Op.notIn]: avoidUsers },
          user_id: { [Op.ne]: loggedUser }, // evitare utilizatorului care o trimis request la cautare
        },
      });
      res.json(matchedUsers);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json("Error while searching users", error);
  }
});

module.exports = router;
