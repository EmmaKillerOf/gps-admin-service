const { parastanStart,paramstandar } = require('../models');

const getDefaultParams = async () => {
  const params = await parastanStart.findAll({
    where: {
      parastat: true,
    },
    raw : false,
  })
  return params
}

const setDefaultParams = async (payload) => {
  return await paramstandar.create({...payload})
}

module.exports = {
  getDefaultParams,
  setDefaultParams
}