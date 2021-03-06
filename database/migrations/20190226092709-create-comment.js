module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      parentId: {
        type: Sequelize.UUID
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      highlightedText: {
        type: Sequelize.STRING
      },
      startPoint: {
        type: Sequelize.INTEGER
      },
      endPoint: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING,
        defaultValue: 'original',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Comments');
  }
};
