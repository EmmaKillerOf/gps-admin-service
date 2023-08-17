'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stepscommand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.execcomma, {as: 'execcomma', foreignKey: 'stepexec'});
    }
  }
  stepscommand.init({
    stepid:{ 
      allowNull: true,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
     commstep:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     steporder:{
      allowNull: false,
      type:DataTypes.INTEGER
     },
     stepkey:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     stepdesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
     stepparam:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
     stepresp:{
      allowNull: false,
      type:DataTypes.INTEGER
     },
     stepchangstat:{
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
     deviesta:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
     stepverclien:{
      allowNull: false,
      type:DataTypes.BOOLEAN
     }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'stepscommand',
    modelName: 'stepscommand',
  });
  return stepscommand;
};