'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class privileges extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.userpriv, {as: 'userpriv', foreignKey: 'privuspr'}) 
    }
  }
  privileges.init({
    privnuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    privdesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    privstat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
    privobse:{ 
      allowNull: false,
      type:DataTypes.STRING
     }, 
    privruta:{ 
      allowNull: false,
      type:DataTypes.STRING
     }, 
    privmeth:{ 
      allowNull: false,
      type:DataTypes.STRING
     }, 
  }, {
    sequelize,
    timestamps: false,
    tableName: 'privileges',
    modelName: 'privileges',
  });
  return privileges;
};