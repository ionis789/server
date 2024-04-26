const { Rooms, Messages, Users } = require("../models");
const { Op } = require("sequelize");
const getRooms = async (loggedUserID) => {
  try {
    const rooms = await Rooms.findAll({
      where: {
        [Op.or]: { user_a: loggedUserID, user_b: loggedUserID },
      },
    });
    // Extrag room_id-urile din rezultatul interogării
    const userRooms = rooms.map((r) => {
      return {
        room_id: r.room_id,
        user_a: r.user_a,
        user_b: r.user_b,
      };
    });
    const allUserRooms = userRooms.map(async (r) => {
      let userCompanion;
      const messages = await Messages.findAll({
        where: {
          room_id: r.room_id,
        },
      });
      loggedUserID === r.user_a
        ? (userCompanion = r.user_b)
        : (userCompanion = r.user_a);
      const userCompanionInfo = await Users.findOne({
        where: {
          user_id: userCompanion,
        },
      });
      return {
        roomID: r.room_id,
        userCompanionInfo,
        messages,
      };
    });
    return await Promise.all(allUserRooms);
  } catch (error) {
    console.error("Eroare la selectarea mesajelor din camere:", error);
    throw error;
  }
};

const createRoom = async (potentialRoom, loggedUserID) => {
  const createdRoom = await Rooms.create(potentialRoom);
  let userCompanion;
  loggedUserID === potentialRoom.user_a
    ? (userCompanion = potentialRoom.user_b)
    : (userCompanion = potentialRoom.user_a);

  // from here I have loggedUserID and userCompanionID

  const userCompanionInfo = await Users.findOne({
    where: {
      user_id: userCompanion,
    },
  });
  return {
    roomID: createdRoom.room_id,
    userCompanionInfo,
    messages: [],
  };
};

module.exports = { getRooms, createRoom };
