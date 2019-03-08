module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define(
    'Report',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      articleId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      reason: { type: DataTypes.STRING },
      description: { type: DataTypes.STRING },
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
  Report.associate = function(models) {
    Report.belongsTo(models.User, { as: 'reporter', foreignKey: 'userId' });
    Report.belongsTo(models.Article, { as: 'article', foreignKey: 'articleId' });
  };
  return Report;
};
