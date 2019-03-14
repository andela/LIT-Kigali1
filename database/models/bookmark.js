module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID
    },
    articleId: {
      type: DataTypes.UUID
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  });
<<<<<<< HEAD
  Bookmark.associate = function(models) {
    Bookmark.belongsTo(models.User, { foreignKey: 'userId' });
    Bookmark.belongsTo(models.Article, { foreignKey: 'articleId' });
=======
  Follow.associate = function(models) {
    Follow.belongsTo(models.User, { foreignKey: 'userId' });
    Follow.belongsTo(models.User, { foreignKey: 'articleId' });
>>>>>>> feat(bookmark): add unit tests [Starts #163519156]
  };
  return Bookmark;
};
