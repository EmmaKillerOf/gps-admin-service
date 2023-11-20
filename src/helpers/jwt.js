const jwt = require('jsonwebtoken')
const config = require('../config/environment')

const generarJWT = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, config.TOKEN.SECRET, (err, token) => {
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