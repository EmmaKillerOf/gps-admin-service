'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.entityDevice, {as: 'entityDevice', foreignKey: 'deviende'});
      this.hasOne(model.carrdevi, {as: 'carrdevi', foreignKey: 'devicade'});
      this.hasMany(model.clasdevi, {as: 'clasdevi', foreignKey: 'deviclde'});
      this.hasMany(model.deviloca, {as: 'deviloca', foreignKey: 'devidelo'});
      this.hasMany(model.kmdevi, {as: 'kmdevi', foreignKey: 'kmdevice'});
      this.hasMany(model.devinoalarm, {as: 'devinoalarm', foreignKey: 'devinodevi'});
    }
  }
  device.init({
    devinuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    entidevi:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    deviimei:{ 
      type:DataTypes.STRING
     },
    devimark:{ 
      type:DataTypes.STRING
     },
    devimode:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    deviphon:{ 
      allowNull: false,
      type:DataTypes.STRING
     }, 
    devistat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'device',
    modelName: 'device',
  });
  return device;
};