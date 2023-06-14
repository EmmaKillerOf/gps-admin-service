'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class entityDevice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
    }
  }
  entityDevice.init({
    endenuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    userende:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    deviende:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'entityDevice',
    modelName: 'entityDevice',
  });
  return entityDevice;
};