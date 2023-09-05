'use strict';
const {
  Model
} = require('sequelize');
const { entityUser, entity } = require('.');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.entityUser, {as: 'entityUser', foreignKey: 'userenus'}) 
    }
  }
  User.init({
    fullname: {
      allowNull: false,
      type: DataTypes.STRING
    },
    username:{
      allowNull: false,
      type:DataTypes.STRING
    },
    usernuid:{
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
    },
    userpass:{
      allowNull: false,
      type:DataTypes.STRING
    },
    userpassshow:{
      allowNull: false,
      type:DataTypes.STRING
    },
    usersupe:{
      allowNull: false,
      defaultValue:false, 
      type:DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'users',
    modelName: 'User',
  });
  return User;
};