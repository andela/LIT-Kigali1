'use strict';
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    parentId: DataTypes.UUID,
    body: DataTypes.STRING,
    userId: DataTypes.UUID
  }, {});
  Comment.associate = function(models) {
    // associations can be defined here
  };
  return Comment;
};