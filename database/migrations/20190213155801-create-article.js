module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Articles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tagList: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      favorited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      favoritesCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'unpublished'
      },
      userId: {
        type: Sequelize.UUID,
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
    return queryInterface.dropTable('Articles');
  }
};
