'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AccessLinks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      token: { type: Sequelize.STRING, allowNull: false, unique: true },
      // привязка к клиенту (User с ролью client) или к записи клиента
      clientId: { type: Sequelize.INTEGER, allowNull: false },
      // опции политики
      expiresAt: { type: Sequelize.DATE, allowNull: true },
      maxDevices: { type: Sequelize.INTEGER, allowNull: true }, // null = без лимита
      maxOpensPerDevice: { type: Sequelize.INTEGER, allowNull: true }, // null = без лимита
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      // для подрядчика/проекта
      contractorId: { type: Sequelize.INTEGER, allowNull: false },
      projectId: { type: Sequelize.INTEGER, allowNull: true },
      // аудит
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AccessLinks');
  }
};
