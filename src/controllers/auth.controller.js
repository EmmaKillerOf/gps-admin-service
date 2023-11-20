const { User } = require('../models');
const { generarJWT } = require('../helpers/jwt');
const entityService = require('../services/entity.service')

const bcrypt = require('bcrypt');

const login = async(req, res) => {
    let body = req.body;
    try {
      const user = await User.findOne({ where:{ username: body.username }})
      if (!user || !bcrypt.compareSync(body.password, user.userpass)) {
          return res.status(401).json({
              ok: false,
              err: {
                  message: 'User or Password invalid'
              }
          });
      }
      // generate token
      delete user.userpass
      const token = await generarJWT(user)
      const entities = await entityService.getActiveByUser(user.usernuid);
      return res.json({
          ok: true,
          user: user,
          entities:[...entities],
          token
      });
    } catch (error) {
      console.log('error',error)
      
    }
}

module.exports = {
    login
}