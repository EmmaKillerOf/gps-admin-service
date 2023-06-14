const { userpriv, privileges } = require('../models');

const getByEntity = async (entityId) => {
  const result = await privileges.findAll({
    attributes: ['privnuid','privdesc', 'privobse'],
    where: {
      '$userpriv.enususpr$': entityId,
    },
    include:{
      model: userpriv,
      as: 'userpriv',
      attributes: []
    },
    raw : true ,
    nest : true
  })
  return result
}

const getAll = async () => {
  const result = await privileges.findAll({
    attributes: ['privnuid','privdesc'],
    where: {
      privstat: true
    }
  })
  return result
}

const getPrivilege = async (query) => {
  const result = await privileges.findOne({
    attributes: ['privnuid','privdesc'],
    where: {
      ...query
    }
  })
  return result
}

const createUserPrivileges = async (payload) => {
  return await userpriv.create({...payload});
}

const updateUserPrivileges = async (entityUserId, payload) => {
  await deleteUserPrivileges(entityUserId)
  return await userpriv.bulkCreate(payload);
}

const deleteUserPrivileges = async (entityUserId) => {
  await userpriv.destroy({
    where: {
      enususpr:entityUserId
    }
  })
}


module.exports = {
  getAll,
  getByEntity,
  createUserPrivileges,
  updateUserPrivileges,
  deleteUserPrivileges,
  getPrivilege
}