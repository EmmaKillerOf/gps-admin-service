'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carrier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasOne(model.carrdevi, { as: 'carrdevi', foreignKey: 'carrcade' });
      this.belongsTo(model.carrcombu, { as: 'carrcombu', foreignKey: 'combucarr' });
    }
  }
  carrier.init({
    carrnuid: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    enticarr: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    carrlice: {
      allowNull: false,
      type: DataTypes.STRING
    },
    carrtype: {
      allowNull: false,
      type: DataTypes.STRING
    },
    combucarr: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    carrcapa: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    carrrendi: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'carrier',
    modelName: 'carrier',
  });
  return carrier;
};