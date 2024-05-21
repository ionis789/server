const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./models");
const { Rooms, Users } = require("./models");
const { Messages } = require("./models");
const app = express();
app.use(cookieParser());
const PORT = process.env.SERVER_PORT || 3008;
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: true,
  },
});
app.use(express.json()); // Folosește express.json() pentru a gestiona JSON body requests
app.use(
  // Aplic middleware-ul cors() pe app cu in asa fel permit cookie si comunicarea cu serverul de pe orice host din partea la client
  cors({
    origin: true,
    credentials: true,
  }),
);

// Routers
const userRouter = require("./routes/Users");
const roomRouter = require("./routes/Rooms");
const authRouter = require("./routes/authRouter");

app.use("/users", userRouter); // Aplică userRouter pe app pentru rutele legate de prelucrarea utilizatorilor
app.use("/rooms", roomRouter); // Aplică roomRouter pe app pentru rutele legate de camere
app.use("/auth", authRouter); // raspunde pentru autorizarea utilizatorului

// Endpoint pentru toate rutele care nu sunt găsite
app.get("/*", (req, res) => {
  res.redirect("https://client-falb.onrender.com");
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} has connected 🤝`);

  // stable connectivity between currentLoggedUsers and his rooms
  socket.on("join_room", (roomIDs) => {
    if (!roomIDs.isEmpty) {
      roomIDs.forEach((IDs) => {
        socket.join(IDs);
      });
    }
  });

  // new message event
  socket.on("send_message", async (messageData, roomID) => {
    try {
      const newMessage = await Messages.create(messageData);
      io.to(roomID).emit("new_message", newMessage.dataValues);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // create new room event
  socket.on("create_room", async ({ loggedUserID, userCompanionID }) => {
    try {
      const newRoom = await Rooms.create({
        user_a: loggedUserID,
        user_b: userCompanionID,
      });
      const newCompanion = await Users.findOne({
        where: {
          user_id: userCompanionID,
        },
      });
      io.emit("new_room", {
        status: 1,
        newRoomData: {
          messages: [],
          roomID: newRoom.dataValues.room_id,
          userCompanionInfo: newCompanion.dataValues,
        },
      });
    } catch (error) {
      io.emit("new_room", { status: 0, error });
    }
  });

  // disconnect user from site event
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} has disconnected 👋`);
  });
});

db.sequelize.sync().then(() => {
  http.listen(PORT, () => console.log(`server start on port ${PORT}`));
});
