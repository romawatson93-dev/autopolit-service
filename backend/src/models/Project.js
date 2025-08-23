// C:\Users\Life PC\Documents\autopolit-service\backend\src\models\Project.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const User = require("./User");

const Project = sequelize.define("Project", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  pdfPath: { type: DataTypes.STRING, allowNull: false } // путь к файлу
});

Project.belongsTo(User, { foreignKey: "contractorId" });
User.hasMany(Project, { foreignKey: "contractorId" });

module.exports = Project;
