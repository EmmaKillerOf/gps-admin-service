
const { encryptPassword, generatePassword } = require('../helpers/helpers');
const userService = require('../services/user.service');
const entityService = require('../services/entity.service');
const entityDeviceService = require('../services/entityDevice.service');
const privilegesService = require('../services/privileges.service');


const getUser = async (req, res) => {
    try {
        const { entityId, privilegies } = req.query
        const userId = req.query.userId || req.uid
        let users,
            privileges,
            usersFiltrered

        // Get privilegies
        if (entityId != undefined && privilegies != undefined) {
            privileges = await userService.getUserPrivilegies(userId, entityId);
        } else if (entityId != undefined) {
            users = await userService.getUsersEntity(entityId);
        }

        if (users)
            usersFiltrered = users.rows.filter(user => user.usernuid != userId)

        const response = usersFiltrered || privileges


        res.status(200).json({
            ok: true,
            response
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: error
        })
    }
}

const createUser = async (req, res) => {
    try {
        const { entityId } = req.params;
        const { name, email, privileges, deviceSelected } = req.body
        let user

        user = await userService.getUser({ username: email })
        const passwordGenerated = generatePassword();
        const passwordEncrypted = await encryptPassword(passwordGenerated);

        const userPayload = {
            username: email,
            userpass: passwordEncrypted,
            fullname: name,
            userpassshow: passwordGenerated
        }
        if (user) {
            const entityUser = entityService.getEntityUser({ userenus: user.usernuid, entienus: entityId });
            if (entityUser) throw 'Entity y usuario ya existen';
        } else {
            user = await userService.createUser(userPayload);
        }

        const entityUserPayload = {
            userenus: user.usernuid,
            entienus: entityId,
            enusrole: 'USER'
        }

        const entityUser = await entityService.createEntityUser(entityUserPayload);

        if (deviceSelected.length > 0) {
            let entityDevicePayload = deviceSelected.map(item => ({
                deviende: item,
                userende: entityUser.enusnuid
            }));
            await entityDeviceService.createEntityDevice(entityDevicePayload);
        }

        if (privileges && privileges.length) {
            const permissionPromises = []
            await privileges.map(async p => {
                const privilege = await privilegesService.getPrivilege({ privdesc: p })
                permissionPromises.push(privilegesService.createUserPrivileges({
                    privuspr: privilege.privnuid, enususpr: entityUser.enusnuid
                }))
            })
            await Promise.all(permissionPromises)
        }
        delete user.userpass
        res.status(200).json({
            ok: true,
            response: user
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: error instanceof ReferenceError ? error.message : error
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const { entityId, userId } = req.params;
        const { name, privileges, deviceSelected } = req.body;
        let user
        user = await userService.getUser({ usernuid: userId });
        if (!user) throw 'Usuario que intenta actualizar no existe';
        const entityUser = await entityService.getEntityUser({ userenus: user.usernuid, entienus: entityId });
        if (!entityUser) throw 'Este usuario no esta vinculado a esta entidad';

        if (name) user = await userService.updateUser(userId, { fullname: name })

        await entityDeviceService.deleteEntityDevice({userende: entityUser.enusnuid});

        if (deviceSelected.length > 0) {
            let entityDevicePayload = deviceSelected.map(item => ({
                deviende: item,
                userende: entityUser.enusnuid
            }));
            await entityDeviceService.createEntityDevice(entityDevicePayload);
        }

        if (privileges && privileges.length) {
            privilegesService.deleteUserPrivileges(entityUser.enusnuid)
            const permissionPromises = await privileges.map(async p => {
                const privilege = await privilegesService.getPrivilege({ privdesc: p })
                permissionPromises.push(privilegesService.createUserPrivileges({
                    privuspr: privilege.privnuid, enususpr: entityUser.enusnuid
                }))
            })
            await Promise.all(permissionPromises)
        }

        res.status(200).json({
            ok: true,
            response: user
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: error instanceof ReferenceError ? error.message : error
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { entityId, userId } = req.params;
        const entityUser = await entityService.getEntityUser({ userenus: userId, entienus: entityId });
        await privilegesService.deleteUserPrivileges(entityUser.enusnuid)
        await entityService.deleteEntityUser(userId, entityId);
        await userService.deleteUser(userId)
        res.status(200).json({
            ok: true,
            message: 'Usuario eliminado'
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: error instanceof ReferenceError ? error.message : error
        })
    }

}

module.exports = {
    getUser,
    createUser,
    updateUser,
    deleteUser
}