'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClientDevice extends Model {
    static associate(models) {
      ClientDevice.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
      ClientDevice.belongsTo(models.AccessLink, { foreignKey: 'linkId' });
      ClientDevice.hasMany(models.ClientSession, { foreignKey: 'deviceId' });
    }
  }

  ClientDevice.init({
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    linkId: { type: DataTypes.INTEGER, allowNull: false },
    fingerprint: { type: DataTypes.STRING, allowNull: true },
    ua: { type: DataTypes.TEXT, allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true },
    lastSeenAt: { type: DataTypes.DATE, allowNull: true },
  }, { sequelize, modelName: 'ClientDevice' });

  return ClientDevice;
};
