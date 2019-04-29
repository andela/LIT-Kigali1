module.exports = (sequelize, DataTypes) => {
  const OldComment = sequelize.define('OldComment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
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
  OldComment.associate = function(models) {
    OldComment.belongsTo(models.Comment, { foreignKey: 'commentId' });
    OldComment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
  };
  return OldComment;
};
