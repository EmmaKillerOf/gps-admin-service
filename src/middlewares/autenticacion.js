const jwt = require('jsonwebtoken');
const config = require('../config/environment')

// =======================
// Verificar Token
// =======================


let verificaToken = (req, res, next) => {
    let token = req.header('token');
    
    try {
        const user = jwt.verify(token, config.TOKEN.SECRET)
        req.uid = user.usernuid
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Token no Valido'
            }
        });
    }
};

const validateSchema = (schema) => async (req, res, next) => {
    try {
 
        const payload = {
            body: req.body,
            params: req.params,
            query: req.query
        }
        await schema.validateAsync(payload);
        return next();
    } catch (error) {
        let errorMessage = "";
        for (const err of error.details) {
            errorMessage += " [ " + err.path.join(" > ") + err.message.slice(err.message.lastIndexOf("\"") + 1) + " ] ";
        }
        return res.status(400).json({ message: errorMessage});
    }
  };

module.exports = {
    verificaToken,
    validateSchema
}