'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class keywords extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.devialar, {as: 'devialar', foreignKey: 'keywdeal'});
    }
  }
  keywords.init({
    keywnuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
    },
    keywcodi:{
      type:DataTypes.STRING 
    },
    keywfunc:{ 
      allowNull: false,
      type:DataTypes.STRING 
    }, 
    keywprio:{ 
      allowNull: false,
      type:DataTypes.INTEGER 
    }, 
    keywoff:{ 
      allowNull: false,
      type:DataTypes.INTEGER 
    }, 
    keywminu:{ 
      allowNull: false,
      type:DataTypes.INTEGER 
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'keywords',
    modelName: 'keywords',
  });
  return keywords;
};