module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    parentId: DataTypes.UUID,
    articleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
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
  Comment.associate = function(models) {
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    Comment.belongsTo(models.Article, { foreignKey: 'articleId' });
    Comment.hasMany(models.Comment, { foreignKey: 'parentId', as: 'replies' });
    Comment.hasMany(models.Favorite_comment, { foreignKey: 'id', as: 'likes' })
  };
  return Comment;
};
