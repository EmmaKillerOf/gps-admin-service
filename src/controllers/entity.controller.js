
const { sequelize } = require('../models');
const userService = require('../services/user.service')
const entityService = require('../services/entity.service')
const privilegesService = require('../services/privileges.service')
const paramsService = require('../services/paramStandar.service')
const { encryptPassword, generatePassword } = require('../helpers/helpers');



const createEntity = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {documentType, documentNumber, description, email, phone, logo} = req.body;
        const userId = req.uid
        let entity, user
    
        user = await userService.getUser({ username: email })
        entity = await entityService.getEntity({ entidoti: documentType, entinnit: documentNumber })
        if (user && entity ){
            const entityUser = entityService.getEntityUser({ userenus: user.usernuid, entienus: entity.entinuid });
            if(entityUser) throw 'Entity y usuario ya existen';
        }
    
        const entityPayload = {
            entidoti: documentType,
            entinnit: documentNumber,
            entidesc: description,
            entimail: email,
            entitele: phone,
            entilogo: logo,
            entistat: true,
            entimuem: true
        }
        if (!entity) entity = await entityService.createEntity(entityPayload);
        const passwordGenerated = generatePassword();
        const passwordEncrypted = await encryptPassword(passwordGenerated);
        console.log({passwordGenerated,passwordEncrypted})
    
        const userPayload = {
            username: email,
            userpass: passwordEncrypted,
            fullname: description,
            usersupe: false
        }
        if (!user) user = await userService.createUser(userPayload)          
    
        const entityUserPayload = {
            userenus: user.usernuid,
            entienus: entity.entinuid,
            enusrole: 'ADMIN'
        }
        const entityUser = await entityService.createEntityUser(entityUserPayload);
        const permissions = await privilegesService.getAll();
        const permissionPromises = []
        permissions.map(p => {
            permissionPromises.push(privilegesService.createUserPrivileges({
                privuspr: p.privnuid, enususpr: entityUser.enusnuid
            }))
        })
        await Promise.all(permissionPromises)
        
        
        const defaultParams = await paramsService.getDefaultParams();
        const params = defaultParams.map(p => {
            const { paradesc, paracodi, paravalu, parastat } = p;
            return paramsService.setDefaultParams({paradesc, paracodi, paravalu, parastat, entipara: entity.entinuid})
        })
        await Promise.all(params)

        await t.commit()

        res.status(200).json({
            ok: true,
            response: entity
        }) 
    } catch (error) {
        await t.rollback();
        console.log(error)
        res.status(500).json({
            error
        }) 
    }
}

const getEntities = async (req, res) => {
    try {
        const { limit, offset} = req.query;
        const pagination = {
            limit: Number(limit) || 10,
            offset: Number(offset) || 0
        }
        const entities = await entityService.getEntities(pagination);
        res.status(200).json({
            ok: true,
            response: entities
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
    
}

const updateEntity = async (req, res) => {
    try {
        const { entityId } = req.params
        const {documentType, documentNumber, description, email, phone, logo, active, mutipleImei } = req.body;
        const entity = await entityService.getEntity({ entinuid: entityId });
        const payloadEntity = {
            entidoti: documentType || entity.entidoti,
            entinnit: documentNumber || entity.entinnit,
            entidesc: description || entity.entidesc,
            entimail: email || entity.entimail,
            entitele: phone || entity.entitele,
            entilogo: logo || entity.entilogo,
            entistat: active || entity.entistat,
            entimuem: mutipleImei || entity.entimuem
        }
        const newEntity = await entityService.updateEntity(entityId, payloadEntity);
        res.status(200).json({
            ok: true,
            response: newEntity
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
    
}

const deactiveEntity = async (req, res) => {
    try {
        const { entityId } = req.params
        const newEntity = await entityService.updateEntity(entityId, { entistat: false });
        res.status(200).json({
            ok: true,
            response: newEntity
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }


}

module.exports = {
    createEntity,
    getEntities,
    updateEntity,
    deactiveEntity
}