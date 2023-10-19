const { entityUser, entity } = require('../models');

const getActiveByUser = async (userId) => {
  const entities = await entity.findAll({
    attributes: ['entinuid', 'entidesc', 'entilogo', 'entimuem'],
    where: {
      entistat: true,
      '$entityUser.enusstat$': true,
      '$entityUser.userenus$': userId
    },
    include:{
      model: entityUser,
      as: 'entityUser',
      attributes: ['enusnuid', 'enuspend']
    },
    raw : true ,
    nest : true
  })
  return entities
}

const getEntities = async (pagination={}) => {
  const entities = await entity.findAndCountAll({
    where: {
      entistat: true,
    },
    order:[
      ['entinuid', 'DESC']
    ],
    raw : true ,
    nest : true
  })
  return entities
}

const getEntity = async (query) => {
  const entityResult = await entity.findOne({
    where: {
      ...query
    }
  })
  return entityResult
}

const getEntityUser = async (query) => {
  const entityResult = await entityUser.findOne({
    where: {
      ...query
    }
  })
  return entityResult
}

const createEntity = async (payload) => {
  const entityResult = await entity.create({...payload})
  return entityResult
}

const updateEntity = async (entityId, payload) => {
  const entityResult = await entity.update({...payload}, {
    where: {
      entinuid: entityId
    }
  })
  return entity.findOne({ where:{ entinuid: entityId }, raw : false,})
}

const updateEntityUser = async (payload, uid) => {

  await entityUser.update({...payload}, {
    where: {
      enusnuid: uid
    }
  });
  
  return entityUser.findOne({ where:{ enusnuid: uid }});
}

const createEntityUser = async (payload) => {
  const entityResult = await entityUser.create({...payload})
  return entityResult
}

const deleteEntityUser = async (userId, entityId) => {
  const entityResult = await entityUser.destroy({
    where: {
      userenus: userId,
      entienus: entityId
    }
  })
  return entityResult
}

module.exports = {
  getActiveByUser,
  getEntity,
  getEntities,
  getEntityUser,
  createEntity,
  createEntityUser,
  deleteEntityUser,
  updateEntity,
  updateEntityUser
}