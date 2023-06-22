'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class devicone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {}
  }
  devicone.init({
    deconuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
    },
    devideco:{ 
      allowNull: false,
      type:DataTypes.INTEGER
    },
    decofesi:{ 
      allowNull: true,
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      get() {
        return this.getDataValue('decofesi'); // To retrieve the current value
      }
    },
    decodesc:{ 
      allowNull: false,
      type:DataTypes.STRING 
    } 
  }, {
    sequelize,
    timestamps: false,
    tableName: 'devicone',
    modelName: 'devicone',
  });
  return devicone;
};