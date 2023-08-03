'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class execcomma extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.belongsTo(model.stepscommand, {as: 'stepscommand', foreignKey: 'stepexec'})
    }
  }
  execcomma.init({
    execid:{ 
      allowNull: true,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
     stepexec:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     deviexec:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
     execparam:{ 
      allowNull: true,
      type:DataTypes.STRING
     },
     execacti:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'execcomma',
    modelName: 'execcomma',
  });

  /* execcomma.afterCreate((instance, options) => {
    const observable = require('../observables/execcomma');
    console.log("insertado en redis");
    observable.sendCommands('listCommands')
    .then(() => {
      console.log('Lista de dispositivos actualizada después de actualizar un registro.');
    })
    .catch((error) => {
      console.error('Error al actualizar la lista de dispositivos después de actualizar:', error);
    });
    // Aquí puedes realizar cualquier acción que desees después de crear un nuevo registro
  });

  // Agregar hook después de actualizar (afterUpdate)
  execcomma.afterUpdate((instance, options) => {
    const observable = require('../observables/execcomma');
    console.log("actualizado en redis");
    observable.sendCommands('listCommands')
    .then(() => {
      console.log('Lista de dispositivos actualizada después de actualizar un registro.');
    })
    .catch((error) => {
      console.error('Error al actualizar la lista de dispositivos después de actualizar:', error);
    });
    // Aquí puedes realizar cualquier acción que desees después de actualizar un registro
  });

  execcomma.afterDestroy((instance, options) => {
    // Hook después de eliminar un registro
    // Aquí puedes realizar cualquier acción que desees después de eliminar un registro
    const observable = require('../observables/execcomma');
    observable.sendCommands('listCommands')
      .then(() => {
        console.log('Lista de dispositivos actualizada después de eliminar un registro.');
      })
      .catch((error) => {
        console.error('Error al actualizar la lista de dispositivos después de eliminar:', error);
      });
  }); */

  return execcomma;
};