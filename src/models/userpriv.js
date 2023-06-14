'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userpriv extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.belongsTo(model.entityUser, {as: 'entityUser', foreignKey: 'enususpr'})
      this.belongsTo(model.privileges, {as: 'privileges', foreignKey: 'privuspr'})
    }
  }
  userpriv.init({
    usprnuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    privuspr:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    enususpr:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'userpriv',
    modelName: 'userpriv',
  });
  return userpriv;
};