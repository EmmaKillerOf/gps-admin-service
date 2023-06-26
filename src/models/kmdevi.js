'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kmdevi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.dehiskm, {as: 'dehiskm', foreignKey: 'dehikmcalc'});
    }
  }
  kmdevi.init({
    kmid:{ 
      allowNull: true,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
     kmdevice:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     kmdeloini:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     kmdelofin:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     kmfeca:{ 
      allowNull: true,
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      get() {
        return this.getDataValue('kmfeca'); // To retrieve the current value
      }
     },
     kmdiacapt:{ 
      allowNull: false,
      type:DataTypes.STRING,
     }, 
     kmcapt:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }, 
  }, {
    sequelize,
    timestamps: false,
    tableName: 'kmdevi',
    modelName: 'kmdevi',
  });
  return kmdevi;
};