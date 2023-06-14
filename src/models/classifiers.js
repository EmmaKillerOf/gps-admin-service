'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class classifiers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.classvalue, {as: 'classvalue', foreignKey: 'clasclva'});
    }
  }
  classifiers.init({
    clasnuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    enticlas:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    clasdesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    classtat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     }, 
  }, {
    sequelize,
    timestamps: false,
    tableName: 'classifiers',
    modelName: 'classifiers',
  });
  return classifiers;
};