'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class execcomma extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
    }
  }
  execcomma.init({
    execid:{ 
      allowNull: true,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
     stepexec:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     deviexec:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     execparam:{ 
      allowNull: true,
      type:DataTypes.STRING
     },
     execacti:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'execcomma',
    modelName: 'execcomma',
  });
  return execcomma;
};