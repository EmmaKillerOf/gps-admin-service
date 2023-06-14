'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class classvalue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.clasdevi, {as: 'clasdevi', foreignKey: 'deviclde'});
    }
  }
  classvalue.init({
    clvanuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    clasclva:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    clvadesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    clvastat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     }, 
    clvaunde:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }, 
  }, {
    sequelize,
    timestamps: false,
    tableName: 'classvalue',
    modelName: 'classvalue',
  });
  return classvalue;
};