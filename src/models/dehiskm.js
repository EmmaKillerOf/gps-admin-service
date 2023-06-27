'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dehiskm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {}
  }
  dehiskm.init({
    dehiid:{ 
      allowNull: true,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
     dehideloca:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     dehikmcalc:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'dehiskm',
    modelName: 'dehiskm',
  });
  return dehiskm;
};