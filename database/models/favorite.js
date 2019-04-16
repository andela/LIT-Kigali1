module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    'Favorite',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      userId: { type: DataTypes.UUID },
      articleId: { type: DataTypes.UUID },
      state: {
        type: DataTypes.STRING
      },
      rating: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {}
  );
  Favorite.associate = function(models) {
    Favorite.belongsTo(models.User, { as: 'author', foreignKey: 'userId' });
    Favorite.belongsTo(models.User, { as: 'authorFavorites', foreignKey: 'userId' });
    Favorite.belongsTo(models.Article, { as: 'favorites', foreignKey: 'articleId' });
  };
  return Favorite;
};
