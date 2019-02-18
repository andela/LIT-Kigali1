module.exports = (sequelize, DataTypes) => {
  const ResetPassword = sequelize.define(
    'ResetPassword',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.UUID
      },
      resetCode: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
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
  ResetPassword.associate = function(models) {
    ResetPassword.belongsTo(models.User, { foreignKey: 'userId' });
  };
  return ResetPassword;
};
