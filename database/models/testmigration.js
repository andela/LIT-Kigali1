'use strict';
module.exports = (sequelize, DataTypes) => {
  const TestMigration = sequelize.define('TestMigration', {
    name: DataTypes.STRING
  }, {});
  TestMigration.associate = function(models) {
    // associations can be defined here
  };
  return TestMigration;
};