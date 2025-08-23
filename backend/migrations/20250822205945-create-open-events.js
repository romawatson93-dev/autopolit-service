'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OpenEvents', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      linkId: { type: Sequelize.INTEGER, allowNull: false },
      clientId: { type: Sequelize.INTEGER, allowNull: true },
      deviceId: { type: Sequelize.INTEGER, allowNull: true },
      ip: { type: Sequelize.STRING, allowNull: true },
      ua: { type: Sequelize.STRING, allowNull: true },
      success: { type: Sequelize.BOOLEAN, defaultValue: false },
      reason: { type: Sequelize.STRING, allowNull: true }, // например expired, devices_limit
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OpenEvents');
  }
};
