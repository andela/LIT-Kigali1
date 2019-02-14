'use strict';
module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    'Follow',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      followee: {
        type: DataTypes.UUID
      },
      follower: {
        type: DataTypes.UUID
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
  Follow.associate = function(models) {
    Follow.belongsTo(models.User, { foreignKey: 'follower' });
    Follow.belongsTo(models.User, { foreignKey: 'followee' });
  };
  return Follow;
};
