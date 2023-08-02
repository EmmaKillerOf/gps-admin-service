'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class entity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.entityUser, {as: 'entityUser', foreignKey: 'entienus'})
      this.hasMany(model.paramstandar, {as: 'paramstandar', foreignKey: 'entipara'})
    }
  }
  entity.init({
    entinuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    entidoti:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    entinnit:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    entidesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    entimail:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    entitele:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    entistat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
    entimuem:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },  
    entilogo:{ 
      allowNull: false,
      type:DataTypes.STRING
     }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'entity',
    modelName: 'entity',
  });
  return entity;
};