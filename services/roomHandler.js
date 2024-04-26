const socketAuthMiddleware = require("../middllewares/socketAuthMiddleware");
class RoomHandler {
  createPrivateRoom(io) {
    io.on("create_private_room", (data) => {
      const ok = socketAuthMiddleware(data.accessToken);
      if (typeof ok == "object") io.emit("private_room_attempt", ok);
      else {
        io.join(data.roomID);
      }
    });
  }
}

module.exports = RoomHandler;
