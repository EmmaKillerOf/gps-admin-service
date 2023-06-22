'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class deviloca extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(model) {}
  }
  deviloca.init({
    delonuid:{ 
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type:DataTypes.INTEGER
    },
    devidelo:{ 
      allowNull: false,
      type:DataTypes.INTEGER
    },
    delotinu:{ 
      allowNull: false,
      type:DataTypes.DATE,
    },
    delofesi:{ 
      allowNull: true,
      type: 'TIMESTAMP',
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    delokeyw:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delotime:{ 
      allowNull: false,
      type:DataTypes.STRING,
    },
    delosimc:{ 
      type:DataTypes.STRING 
    },
    delosign:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delohour:{ 
      type:DataTypes.STRING 
    },
    delosigc:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delolati:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delolaor:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delolong:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    deloloor:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delospee:{ 
      allowNull: false,
      type:DataTypes.STRING 
    },
    delodat1:{ 
      type:DataTypes.STRING 
    },
    delodat2:{ 
      type:DataTypes.STRING 
    },
    deloacc:{ 
      type:DataTypes.STRING 
    },
    delodoor:{ 
      type:DataTypes.STRING 
    },
    delodat3:{ 
      type:DataTypes.STRING 
    },
    delodat4:{ 
      type:DataTypes.STRING 
    },
    delodat5:{ 
      type:DataTypes.STRING 
    },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'deviloca',
    modelName: 'deviloca',
  });
  return deviloca;
};