// models/Session.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Session = sequelize.define("Session", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.BIGINT, allowNull: false },
    refreshToken: { type: DataTypes.TEXT, allowNull: false, unique: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false }
  }, {
    tableName: "sessions",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { unique: true, fields: ["refreshToken"] }]
  });

  return Session;
};
