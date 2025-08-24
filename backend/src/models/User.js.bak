// C:\Users\Life PC\Documents\autopolit-service\backend\src\models\User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  role: { type: DataTypes.ENUM("contractor", "client"), allowNull: false }
});

module.exports = User;
