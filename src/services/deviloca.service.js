const { deviloca } = require('../models');
const { Op } = require('sequelize');

const createLocation = async (payload) => {
  return await deviloca.create({ ...payload })
}

const updateCalcKm = async (deviceId, init, fin) => {
  return await deviloca.update(
    { delocalcu: true },
    {
      where: {
        delonuid: {
          [Op.gte]: init,
          [Op.lte]: fin   
        },
        devidelo: deviceId
      }
    }
  );
}

module.exports = {
  createLocation,
  updateCalcKm
}