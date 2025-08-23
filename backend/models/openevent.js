'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OpenEvent extends Model {
    static associate(models) {
      OpenEvent.belongsTo(models.AccessLink, { foreignKey: 'linkId' });
      OpenEvent.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
      OpenEvent.belongsTo(models.ClientDevice, { foreignKey: 'deviceId' });
    }
  }

  OpenEvent.init({
    linkId: { type: DataTypes.INTEGER, allowNull: false },
    clientId: { type: DataTypes.INTEGER, allowNull: true },
    deviceId: { type: DataTypes.INTEGER, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    ua: { type: DataTypes.TEXT, allowNull: true },
    success: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    reason: { type: DataTypes.STRING, allowNull: true },
  }, { sequelize, modelName: 'OpenEvent' });

  return OpenEvent;
};
