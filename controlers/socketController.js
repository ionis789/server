const MessagesHandler = require("../services/messagesHandler");
const RoomHandler = require("../services/roomHandler.js");
const { Messages } = require("../models");
class SocketController {
  constructor(socket) {
    this.socket = socket;
    this.messageHandler = new MessagesHandler();
    this.roomHandler = new RoomHandler();
  }

  connect() {
    this.socket.on("connection", (io) => {
      console.log(`User ${io.id} has connected 🤝`);
      io.on("create_private_room", (data) => {
        io.join(data.roomID);
      });
      io.on("send_message", async (messageData) => {
        try {
          const newMessage = await Messages.create(messageData);
          io.to(newMessage.dataValues.room_id).emit(
            "new_message",
            newMessage.dataValues,
          );
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });
      io.on("disconnect", () => {
        console.log(`User ${io.id} has disconnected 👋`);
      });
      // this.roomHandler.createPrivateRoom(io); // responsible for creating a private room between only 2 users
      // this.messageHandler.handleMessageSending(io); // responsible for transferring messages between users
      // this.messageHandler.handleConnection(io); // show if users disconnect
    });
  }
}

module.exports = SocketController;
