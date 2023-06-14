const { keywords } = require('../models');

const getKeyword = async (query) => {
  const keyword = await keywords.findOne({
    where: {
      ...query
    }
  })
  return keyword
}

module.exports = {
  getKeyword
}