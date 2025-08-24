// C:\Users\Life PC\Documents\autopolit-service\backend\src\models\Estimate.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const Project = require("./Project");

const Estimate = sequelize.define("Estimate", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  pdfPath: { type: DataTypes.STRING, allowNull: false }
});

Estimate.belongsTo(Project, { foreignKey: "projectId" });
Project.hasMany(Estimate, { foreignKey: "projectId" });

module.exports = Estimate;
