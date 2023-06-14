const { classvalue } = require('../models');

const getClassvalue = async (query) => {
  const classvalue = await classvalue.findOne({
    where: {
      ...query
    }
  })
  return classvalue
}

module.exports = {
  getClassvalue
}