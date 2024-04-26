module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define("Messages", {
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Rooms",
        key: "room_id",
      },
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return Messages;
};
