module.exports = (sequelize, DataTypes) => {
  const Reader = sequelize.define(
    'Reader',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      articleId: {
        type: DataTypes.UUID,
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
    },
    {}
  );
  Reader.associate = function(models) {
    Reader.belongsTo(models.User, { as: 'reader', foreignKey: 'userId' });
    Reader.belongsTo(models.Article, { as: 'views', foreignKey: 'articleId' });
  };
  return Reader;
};
