'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class devialar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {
      this.hasMany(model.keywords, {as: 'keywords', foreignKey: 'keywnuid'});
    }
  }
  devialar.init({
    dealnuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
    },
    devideal:{ 
      allowNull: false,
      type:DataTypes.INTEGER
    },
    keywdeal:{ 
      allowNull: false,
      type:DataTypes.INTEGER
    },
    dealfesi:{ 
      allowNull: true,
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      get() {
        return this.getDataValue('dealfesi'); // To retrieve the current value
      }
    },
    dealstat:{ 
      allowNull: false,
      type:DataTypes.BOOLEAN 
    },
    dealtinu:{ 
      allowNull: false,
      type:DataTypes.STRING,
    },
    dealtime:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    dealsign:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    dealhour:{ 
      type:DataTypes.STRING 
    },
    deallati:{ 
      allowNull: true,
      type:DataTypes.STRING 
    },
    deallaor:{ 
      allowNull: true,
      type:DataTypes.STRING 
    },
    deallong:{ 
      allowNull: true,
      type:DataTypes.STRING 
    },
    dealloor:{ 
      allowNull: true,
      type:DataTypes.STRING 
    },
    dealspee:{ 
      allowNull: true,
      type:DataTypes.STRING 
    },
    delotinude:{
      allowNull: false,
      type:DataTypes.DATE        
    },
    delodire:{ 
      type:DataTypes.STRING 
    },
    delobarri:{ 
      type:DataTypes.STRING 
    },
    delomuni:{ 
      type:DataTypes.STRING 
    },  
    delodepa:{ 
      type:DataTypes.STRING 
    },
    delopais:{ 
      type:DataTypes.STRING 
    },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'devialar',
    modelName: 'devialar',
  });
  return devialar;
};