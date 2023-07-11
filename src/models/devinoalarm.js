'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class devinoalarm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) { }
  }
  devinoalarm.init({
    devinonuid: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    devinodevi: {
      type: DataTypes.INTEGER
    },
    devinofesi: {
      allowNull: true,
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      get() {
        return this.getDataValue('devinofesi'); // To retrieve the current value
      }
    },
    devinotime: {
      allowNull: false,
      type: DataTypes.STRING
    },
    devinoalarm: {
      allowNull: false,
      type: DataTypes.STRING
    },
    devinocade: {
      allowNull: false,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'devinoalarm',
    modelName: 'devinoalarm',
  });
  return devinoalarm;
};