const express = require("express");
const router = express.Router();
const authMiddleware = require("../middllewares/authMiddleware");
const roomController = require("../controlers/roomController");
router.get("/", authMiddleware, async (req, res) => {
  try {
    const loggedUserID = req.user; // comes from authMiddleware witch decode current logged userID from access token
    const userRooms = await roomController.getRooms(loggedUserID); // return rooms witch contain messages
    res.json({ userRooms });
  } catch (error) {
    res.status(500).json({ message: "Eroare la selectarea mesajelor" });
  }
});
module.exports = router;
