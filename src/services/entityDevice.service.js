
const { entityDevice } = require('../models');

const getByEntityUser = async (userId, entityId) => {
  const entities = await entityDevice.findOne({
    where: {
      userende: entityId,
      deviende: userId
    }
  })
  return entities
}

const createEntityDevice = async (payload) => {
  const creates = await entityDevice.bulkCreate(payload);
  return creates
}

const deleteEntityDevice = async (query) => {
  const deletes = await entityDevice.destroy({
    where:{
      ...query
    }
  });
  return deletes
}

module.exports = {
  getByEntityUser,
  createEntityDevice,
  deleteEntityDevice
}