'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carrdevi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.belongsTo(model.device, {foreignKey: 'devicade'});
      this.belongsTo(model.carrier, {foreignKey: 'carrcade'});
    }
  }
  carrdevi.init({
    cadenuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    carrcade:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    devicade:{ 
      allowNull: false,
      type:DataTypes.STRING 
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'carrdevi',
    modelName: 'carrdevi',
  });
  return carrdevi;
};