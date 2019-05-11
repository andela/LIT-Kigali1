module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    involvedId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    notification: DataTypes.STRING,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    link: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'unread'
    },
    createdAt: { type: DataTypes.DATE },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  });
  Notification.associate = function(models) {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
    Notification.belongsTo(models.User, { foreignKey: 'involvedId', as: 'involved' });
  };
  return Notification;
};
