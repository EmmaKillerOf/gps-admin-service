'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class clasdevi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.belongsTo(model.classvalue, {as: 'classvalue', foreignKey: 'clvaclde'});
      // this.belongsTo(model.device, {as: 'device', foreignKey: 'deviclde'});
    }
  }
  clasdevi.init({
    cldenuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    deviclde:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    clvaclde:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'clasdevi',
    modelName: 'clasdevi',
  });
  return clasdevi;
};