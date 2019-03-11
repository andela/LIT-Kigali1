'use strict';
module.exports = (sequelize, DataTypes) => {
  const FavoriteComment = sequelize.define('FavoriteComment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    value: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });
  FavoriteComment.associate = function(models) {
    FavoriteComment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    FavoriteComment.belongsTo(models.Comment, { foreignKey: 'commentId' });
  };
  return FavoriteComment;
};
