'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paramstandar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
    }
  }
  paramstandar.init({
    paranuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    entipara:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }, 
    paradesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    paracodi:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    paravalu:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    parastat:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'paramstandar',
    modelName: 'paramstandar',
  });
  return paramstandar;
};