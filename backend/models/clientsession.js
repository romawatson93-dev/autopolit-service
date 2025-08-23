'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClientSession extends Model {
    static associate(models) {
      ClientSession.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
      ClientSession.belongsTo(models.ClientDevice, { foreignKey: 'deviceId' });
    }
  }

  ClientSession.init({
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    deviceId: { type: DataTypes.INTEGER, allowNull: false },
    refreshToken: { type: DataTypes.STRING, allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  }, { sequelize, modelName: 'ClientSession' });

  return ClientSession;
};
