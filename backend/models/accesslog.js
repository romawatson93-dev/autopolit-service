"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AccessLog extends Model {
    static associate(models) {
      // Лог относится к одной ссылке
      AccessLog.belongsTo(models.Link, { foreignKey: "linkId", as: "link" });
    }
  }

  AccessLog.init(
    {
      linkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      openedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "AccessLog",
      tableName: "AccessLogs",
    }
  );

  return AccessLog;
};
