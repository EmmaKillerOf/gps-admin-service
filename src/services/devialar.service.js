const { devialar } = require('../models');

const createAlarm = async (payload) => {
  const lastRecord = await devialar.findAll({
    where: {
      devideal: payload.devideal,
      deallati: payload.deallati,
      deallong: payload.deallong
    },
    order: [['devideal', 'DESC']],
    limit: 2
  });

  const valid = await devialar.findOne({
    where: {
      devideal: payload.devideal,
      dealtime: payload.dealtime
    }
  });

  if (lastRecord.length < 2 && !valid) {
    return await devialar.create({...payload})
  } else if (lastRecord.length >= 2) {
    return await devialar.update(
      {
        dealtime: payload.dealtime,
        delotinude: payload.delotinude,
        delotinu: payload.delotinu
      },
      {
        where: { devideal: lastRecord[0].devideal }
      }
    );
  }
}

module.exports = {
  createAlarm
}