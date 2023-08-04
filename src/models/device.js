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
      this.hasMany(model.devialar, {as: 'devialar', foreignKey: 'devideal'});
      this.hasMany(model.kmdevi, {as: 'kmdevi', foreignKey: 'kmdevice'});
      this.hasMany(model.devinoalarm, {as: 'devinoalarm', foreignKey: 'devinodevi'});
      this.belongsTo(model.entity, {as: 'entity', foreignKey: 'entidevi'})
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
     deviestacomma:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'device',
    modelName: 'device',
  });

  device.afterCreate((instance, options) => {
    const observableDevice = require('../observables/device');
    observableDevice.sendDevices('listDevices')
    .then(() => {
      console.log('Lista de dispositivos actualizada después de actualizar un registro.');
    })
    .catch((error) => {
      console.error('Error al actualizar la lista de dispositivos después de actualizar:', error);
    });
    // Aquí puedes realizar cualquier acción que desees después de crear un nuevo registro
  });

  // Agregar hook después de actualizar (afterUpdate)
  device.afterUpdate((instance, options) => {
    const observableDevice = require('../observables/device');
    console.log("actualizado");
    observableDevice.sendDevices('listDevices')
    .then(() => {
      console.log('Lista de dispositivos actualizada después de actualizar un registro.');
    })
    .catch((error) => {
      console.error('Error al actualizar la lista de dispositivos después de actualizar:', error);
    });
    // Aquí puedes realizar cualquier acción que desees después de actualizar un registro
  });

  device.afterDestroy((instance, options) => {
    // Hook después de eliminar un registro
    // Aquí puedes realizar cualquier acción que desees después de eliminar un registro
    const observableDevice = require('../observables/device');
    observableDevice.sendDevices('listDevices')
      .then(() => {
        console.log('Lista de dispositivos actualizada después de eliminar un registro.');
      })
      .catch((error) => {
        console.error('Error al actualizar la lista de dispositivos después de eliminar:', error);
      });
  });


  return device;
};