'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carrcombu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {}
  }
  carrcombu.init({
    combuid: {
      allowNull: false,
      type: DataTypes.STRING
    },
    combunomb:{
      allowNull: false,
      type:DataTypes.STRING
    },
    combuesta:{
      allowNull: false,
      defaultValue:true, 
      type:DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'carrcombu',
    modelName: 'carrcombu',
  });
  return carrcombu;
};