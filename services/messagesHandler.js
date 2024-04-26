const { Messages } = require("../models");

class MessagesHandler {
  handleMessageSending = (io) => {
    io.on("send_message", async (messageData) => {
      try {
        const newMessage = await Messages.create(messageData);
        /*
        Example:
        newMessage.dataValues {
            message_id: 58,
            room_id: 5,
            sender_id: 5,
            message_text: 'dsds',
            updatedAt: 2024-04-13T15:32:13.041Z,
            createdAt: 2024-04-13T15:32:13.041Z
         }
       * */
        io.to(newMessage.dataValues.room_id).emit(
          "new_message",
          newMessage.dataValues,
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };
  handleConnection(io) {
    io.on("disconnect", () => {
      console.log(`User ${io.id} has disconnected 👋`);
    });
  }
}
module.exports = MessagesHandler;
