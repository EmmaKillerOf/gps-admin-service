'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class parastanStart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
    }
  }
  parastanStart.init({
    paranuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
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
     paratypecoma: { 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'parastanStart',
    modelName: 'parastanStart',
  });
  return parastanStart;
};