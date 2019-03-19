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
  Bookmark.associate = function(models) {
    Bookmark.belongsTo(models.User, { foreignKey: 'userId' });
    Bookmark.belongsTo(models.Article, { foreignKey: 'articleId' });
  };
  return Bookmark;
};
