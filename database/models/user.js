module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    firstName: {type: DataTypes.STRING},
    lastName: {type: DataTypes.STRING},
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bio: {type: DataTypes.TEXT},
    gender: {type: DataTypes.STRING},
    birthDate: {type: DataTypes.DATE},
    image: {type: DataTypes.STRING},
    cover: {type: DataTypes.STRING},
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    userType: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    },
    confirmationCode: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4
    },
    confirmed: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    notification: {
      type: DataTypes.STRING,
      defaultValue: 'enabled'
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
  User.associate = function(models) {
    User.hasMany(models.ResetPassword, { foreignKey: 'userId' });
    User.hasMany(models.Token, { foreignKey: 'userId' });
    User.hasMany(models.Article, { foreignKey: 'userId' });
    User.hasMany(models.Follow, { foreignKey: 'follower', as: 'userFollower' });
    User.hasMany(models.Report, { foreignKey: 'userId' });
  };
  return User;
};
