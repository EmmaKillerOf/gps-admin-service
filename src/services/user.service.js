const { entityUser, User, privileges, userpriv } = require('../models');
const entityUserService = require('./entityUser.service')
const privilegesService = require('./privileges.service')

const getUserPrivilegies = async (userId, entityId) => {
  console.log({userId, entityId})
  const entity = await entityUserService.getByEntityUser(userId, entityId)
  const permissions = await privilegesService.getByEntity(entity.enusnuid)
  return permissions.map(p => {
    return {key: p.privdesc, value: p.privobse}
  });
}

const getUsersEntity = async (entityId, pagination = {}) => {
  let users = await User.findAll({
    attributes: ['fullname', 'username', 'usernuid', 'usersupe', 'userpassshow'],
    order: [['usernuid', 'DESC']],
    include: {
      model: entityUser,
      as: 'entityUser',
      where: {
        entienus: entityId,
      },
      order: [['usernuid', 'DESC']],
      attributes: ['enusstat', 'entienus'],
    },
    raw: true, // Devuelve objetos planos en lugar de instancias de modelos
    nest: true, // Permite que las propiedades se aniden bajo el modelo principal
  });

  // Ahora puedes acceder a las propiedades de entityUser directamente en cada fila
  console.log(users);

  return users;
};

const getUser = async (query) => {
  const user = await User.findOne({
    attributes: ['fullname', 'username', 'usernuid', 'usersupe'],
    where: {
      ...query
    }
  })
  return user
}

const createUser = async (payload) => {
  return await User.create({...payload})
}

const updateUser = async (userId, payload) => {
  await User.update({...payload},
    { 
      where: {
        usernuid: userId
      }
  })
  return await User.findOne({ attributes:{ exclude:['userpass'] }, where:{usernuid: userId}, raw : false,})
}

const deleteUser = async (userId) => {
  return await User.destroy({ 
      where: {
        usernuid: userId
      }
  })
}

module.exports = {
  getUserPrivilegies,
  getUsersEntity,
  getUser,
  createUser,
  updateUser,
  deleteUser
}