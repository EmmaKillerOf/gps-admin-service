'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class commands extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.stepscommand, {as: 'stepscommand', foreignKey: 'commstep'});
    }
  }
  commands.init({
    commid:{ 
      allowNull: true,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
     commtitle:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
     commdesc:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
     commstat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN
     },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'commands',
    modelName: 'commands',
  });
  return commands;
};