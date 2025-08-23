'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ClientDevices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      clientId: { type: Sequelize.INTEGER, allowNull: false },
      linkId: { type: Sequelize.INTEGER, allowNull: false },
      ua: { type: Sequelize.STRING, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: true },
      lastSeenAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ClientDevices');
  }
};
