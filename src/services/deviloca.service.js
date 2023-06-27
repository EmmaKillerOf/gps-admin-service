const { deviloca } = require('../models');
const { Op } = require('sequelize');

const createLocation = async (payload) => {
  const lastRecord = await deviloca.findAll({
    where: {
      devidelo: payload.devidelo,
      delolati: payload.delolati,
      delolong: payload.delolong
    },
    order: [['delonuid', 'DESC']],
    limit: 2
  });

  const valid = await deviloca.findOne({
    where: {
      devidelo: payload.devidelo,
      delotime: payload.delotime
    }
  });

  if (lastRecord.length < 2 && !valid) {
    return await deviloca.create(payload);
  } else if (lastRecord.length >= 2) {
    return await deviloca.update(
      {
        delotime: payload.delotime,
        delotinude: payload.delotinude,
        delotinu: payload.delotinu
      },
      {
        where: { delonuid: lastRecord[0].delonuid }
      }
    );
  }
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

const getRowsUpdate = async (deviceId, init, fin) => {
  return await deviloca.findAll(
    {
      where: {
        delocalcu: true,
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
  updateCalcKm,
  getRowsUpdate
}