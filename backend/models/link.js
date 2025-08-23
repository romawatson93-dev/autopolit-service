"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Link extends Model {
    static associate(models) {
      // Связь: у ссылки много логов
      Link.hasMany(models.AccessLog, { foreignKey: "linkId", as: "logs" });
    }

    // Виртуальное поле: готовая ссылка для клиента
    get fullUrl() {
      return `${process.env.APP_URL || "http://localhost:3000"}/open/${this.token}`;
    }
  }

  Link.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      contractorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      clientName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      maxOpens: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      openCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Link",
      tableName: "Links", // фиксируем имя таблицы
    }
  );

  return Link;
};
