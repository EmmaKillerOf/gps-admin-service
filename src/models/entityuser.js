'use strict';
const {
  Model
} = require('sequelize');
const { entity, User, userpriv, privileges } = require('.');
module.exports = (sequelize, DataTypes) => {
  class entityUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.userpriv, {as: 'userpriv', foreignKey: 'enususpr'}) 
      // this.belongsToMany(model.privileges, { through: 'userpriv' });
      // model.privileges.belongsToMany(this, { through: 'userpriv' });
    }
  }
  entityUser.init({
    enusnuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
     },
    entienus:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     },
    enuspend:{ 
      allowNull: false,
      defaultValue:true,
      type:DataTypes.BOOLEAN
     },
    enusrole:{ 
      allowNull: false,
      type:DataTypes.STRING
     },
    enusstat:{ 
      allowNull: false,
      defaultValue:true,
      type:DataTypes.BOOLEAN
     },
    userenus:{ 
      allowNull: false,
      type:DataTypes.INTEGER
     }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'entityUser',
    tableName: 'entityUser',
  });
  
  return entityUser;
};
