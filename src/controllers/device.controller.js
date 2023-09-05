const { sequelize } = require('../models');
const deviceService = require('../services/device.service')
const entityService = require('../services/entity.service')
const classifierService = require('../services/classifier.service')


const createDevice = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { entityId } = req.params;
        const { imei, brand, model, phoneNumber } = req.body;

        const device = await deviceService.getDevice({ deviimei: imei })
        // if (!device) throw 'Este Imei ya existe';

        const devicePayload = {
            entidevi: entityId,
            deviimei: imei,
            devimark: brand,
            devimode: model,
            deviphon: phoneNumber,
            devistat: true
        }

        const newDevice = await deviceService.createDevice(devicePayload);

        await t.commit()

        res.status(200).json({
            ok: true,
            response: newDevice
        })
    } catch (error) {
        await t.rollback();
        console.log(error)
        res.status(500).json({
            message: error instanceof ReferenceError ? error.message : error
        })
    }
}

const getDevices = async (req, res) => {
    try {
        const { available, limit, offset } = req.query;
        const { entityId, userSelectedId } = req.params;
        const userId = userSelectedId !== 'null' ? userSelectedId : req.uid;
        let devices;
        if (userSelectedId !== 'null') {
            const entityUser = await entityService.getEntityUser({ entienus: entityId, userenus: userId });
            if (!entityUser) {
                throw "Este usuario no tiene entidades asociadas";
            }
            const enusnuid = entityUser.enusrole === 'ADMIN' ? null : entityUser.enusnuid;
            devices = await deviceService.getDevices(entityId, available, enusnuid, userSelectedId);
        } else {
            devices = await deviceService.getDevices(entityId, available, null, userSelectedId);
        }

        res.status(200).json({
            ok: true,
            response: devices
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }

}

const updateDevice = async (req, res) => {
    try {
        const { deviceId } = req.params
        const { brand, model, phoneNumber, state, classifiers } = req.body;
        const device = await deviceService.getDevice({ devinuid: deviceId });
        if (!device) throw 'Id de dispositivo invalido';


        const payloadDevice = {
            devimark: brand || device.devimark,
            devimode: model || device.devimode,
            deviphon: phoneNumber || device.deviphon,
            devistat: state != undefined ? state : device.devistat
        }
        const newDevice = await deviceService.updateDevice(deviceId, payloadDevice);
        if (classifiers && classifiers.length) {
            const flatedClassifiers = classifiers.flat(2)
            const classifiersCollection = new Set(flatedClassifiers);
            const uniqueClassifiers = [...classifiersCollection]
            // classifiers.map(c => {
            //     const chill = classifierService.getChildClassifier({
            //         clvanuid : c
            //     })
            // })
            const clasdeviPayload = uniqueClassifiers.map(c => {
                return { deviclde: deviceId, clvaclde: c }
            })
            console.log(clasdeviPayload)
            await deviceService.deleteClasdevi(deviceId);
            await deviceService.createClasdevi(clasdeviPayload)
        }

        res.status(200).json({
            ok: true,
            response: await deviceService.getDevice({ devinuid: newDevice.devinuid })
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}


const deleteDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const device = await deviceService.getDevice({ devinuid: deviceId })
        if (!device) throw 'Id de dispositivo invalido';
        const deletePromise = [
            deviceService.deleteUserDevice(deviceId),
            deviceService.deleteCarrierDevice(deviceId),
        ]
        await Promise.all(deletePromise);
        await deviceService.deleteDevice(deviceId);
        res.status(200).json({
            ok: true,
            message: 'Dispositivo eliminado'
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}

const unlinkDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const device = await deviceService.getDevice({ deviimei: deviceId })
        if (!device) throw 'Id de dispositivo invalido';
        await deviceService.deleteCarrierDevice(device.devinuid);
        res.status(200).json({
            ok: true,
            message: 'Dispositivo desvinculado'
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        })
    }
}

module.exports = {
    createDevice,
    getDevices,
    updateDevice,
    deleteDevice,
    unlinkDevice
}