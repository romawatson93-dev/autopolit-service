// models/User.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.BIGINT, // Telegram user id может быть большим
      primaryKey: true
    },
    username: { type: DataTypes.STRING, allowNull: true },
    first_name: { type: DataTypes.STRING, allowNull: true },
    last_name: { type: DataTypes.STRING, allowNull: true },
    language_code: { type: DataTypes.STRING(8), allowNull: true }
  }, {
    tableName: "users",
    timestamps: true
  });

  return User;
};
