const jwt = require('jsonwebtoken')
const config = require('../config/environment')

const generarJWT = (payload) => {
    console.log(config.TOKEN.EXPIRATION)
    return new Promise((resolve, reject) => {
        jwt.sign(payload, config.TOKEN.SECRET, {
            expiresIn: config.TOKEN.EXPIRATION
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('no se pudo generar el token ')
            } else {
                resolve(token)
            }
        })

    })

}

module.exports = {
    generarJWT
}