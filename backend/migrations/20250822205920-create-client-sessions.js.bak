'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ClientSessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      clientId: { type: Sequelize.INTEGER, allowNull: false },
      deviceId: { type: Sequelize.INTEGER, allowNull: false },
      refreshToken: { type: Sequelize.STRING, allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ClientSessions');
  }
};
