'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessLink extends Model {
    static associate(models) {
      AccessLink.belongsTo(models.User, { as: 'contractor', foreignKey: 'contractorId' });
      AccessLink.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
      AccessLink.hasMany(models.ClientDevice, { foreignKey: 'linkId' });
      AccessLink.hasMany(models.OpenEvent, { foreignKey: 'linkId' });
    }
  }

  AccessLink.init({
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    contractorId: { type: DataTypes.INTEGER, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    maxDevices: { type: DataTypes.INTEGER, allowNull: true },
    maxOpensPerDevice: { type: DataTypes.INTEGER, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { sequelize, modelName: 'AccessLink' });

  return AccessLink;
};
