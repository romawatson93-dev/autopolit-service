'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      // связь: много сессий у одного пользователя
      Session.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  Session.init(
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.BIGINT, allowNull: false },
      refreshToken: { type: DataTypes.TEXT, allowNull: false, unique: true },
      userAgent: { type: DataTypes.STRING, allowNull: true },
      ip: { type: DataTypes.STRING, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Session',
      tableName: 'sessions',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { unique: true, fields: ['refreshToken'] },
      ],
    }
  );

  return Session;
};
