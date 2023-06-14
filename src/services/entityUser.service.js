
const { entityUser } = require('../models');

const getByEntityUser = async (userId, entityId) => {
  const entities = await entityUser.findOne({
    where: {
      entienus: entityId,
      userenus: userId
    }
  })
  return entities
}

module.exports = {
  getByEntityUser
}