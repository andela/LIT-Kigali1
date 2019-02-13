module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      tagList: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      favorited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      favoritesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.TEXT)
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'unpublished'
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      }
    },
    {}
  );
  Article.associate = function(models) {
    Article.belongsTo(models.User, { foreignKey: 'userId' });
  };
  return Article;
};
