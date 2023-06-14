const { entityUser, User, privileges, userpriv } = require('../models');
const entityUserService = require('./entityUser.service')
const privilegesService = require('./privileges.service')

const getUserPrivilegies = async (userId, entityId) => {
  console.log({userId, entityId})
  const entity = await entityUserService.getByEntityUser(userId, entityId)
  const permissions = await privilegesService.getByEntity(entity.enusnuid)
  return permissions.map(p => {
    return  p.privdesc
  });
}

const getUsersEntity = async (entityId, pagination={}) => {

  const users = await User.findAndCountAll({
    attributes: ['fullname', 'username', 'usernuid', 'usersupe'],
    order:[['usernuid', 'DESC']],
    include:{
      model: entityUser,
      as: 'entityUser',
      where: {
        entienus: entityId
      },
      order:[
        ['usernuid', 'DESC']
      ],
      attributes: ['enusstat','entienus'],
      // include:{
      //   model: userpriv,
      //   as: 'userpriv',
      //   attributes:['privuspr'],
      //   include:{
      //     model: privileges,
      //     as: 'privileges',
      //   }
      // }
    },
    raw : false ,
    nest : true

  })
  return users
}

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