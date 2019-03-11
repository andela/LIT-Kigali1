'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite_comment = sequelize.define('Favorite_comment', {
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
  Favorite_comment.associate = function(models) {
    Favorite_comment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    Favorite_comment.belongsTo(models.Comment, { foreignKey: 'commentId' });
  };
  return Favorite_comment;
};
