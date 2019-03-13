module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
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
      slug: {
        type: DataTypes.STRING,
        allowNull: false
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
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'unpublished'
      },
      cover: { type: DataTypes.STRING },
      readingTime: { type: DataTypes.STRING },
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
  Article.associate = function(models) {
    Article.belongsTo(models.User, { as: 'author', foreignKey: 'userId' });
    Article.hasMany(models.Favorite, { foreignKey: 'articleId' });
    Article.hasMany(models.Comment, { foreignKey: 'articleId' });
    Article.hasMany(models.Report, { foreignKey: 'articleId' }, { onDelete: 'cascade' });
    Article.hasMany(models.Reader, { as: 'views', foreignKey: 'articleId' });
  };
  return Article;
};
