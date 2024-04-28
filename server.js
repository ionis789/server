const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./models");
const { Rooms, Users } = require("./models");
const { Messages } = require("./models");
const path = require("path");
const app = express();
app.use(cookieParser());
const PORT = process.env.SERVER_PORT || 3008;
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: true,
    credentials: true,
  },
});
app.use(express.json()); // Folosește express.json() pentru a gestiona JSON body requests
app.use(
  // Aplic middleware-ul cors() pe app cu in asa fel permit cookie si comunicarea cu serverul de pe orice orice host din partea la client
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
  res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} has connected 🤝`);

  socket.on("join_room", (roomID) => {
    if (!roomID.isEmpty) {
      roomID.forEach((rID) => {
        socket.join(rID);
      });
    }
  });

  // Eveniment pentru trimiterea unui mesaj
  socket.on("send_message", async (messageData, roomID) => {
    try {
      const newMessage = await Messages.create(messageData);
      io.to(roomID).emit("new_message", newMessage.dataValues);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
  socket.on("create_room", async ({ loggedUserID, userCompanionID }) => {
    try {
      const createdRoom = await Rooms.create({
        user_a: loggedUserID,
        user_b: userCompanionID,
      });
      const userCompanionInfo = await Users.findOne({
        where: {
          user_id: userCompanionID,
        },
      });
      io.emit("new_room", {
        status: 1,
      });
    } catch (error) {
      io.emit("new_room", { status: 0 });
    }
  });

  // Eveniment pentru deconectarea unui client
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} has disconnected 👋`);
  });
});

db.sequelize.sync().then(() => {
  http.listen(PORT, () => console.log(`server start on port ${PORT}`));
});
