const { devialar } = require('../models');

const createAlarm = async (payload) => {
  return await devialar.create({...payload})
}

module.exports = {
  createAlarm
}