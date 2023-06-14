const { Op } = require('sequelize');
const { sequelize } = require('../models');
const carrierService = require('../services/carrier.service');
const deviceService = require('../services/device.service');



const createCarrier = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { entityId } = req.params;
        const { idNumber, type, deviceId } = req.body;
    
        const carrier = await carrierService.getCarrier({ carrlice: idNumber, enticarr: entityId });
        if (carrier) throw 'Este vehiculo ya existe';
        
        const carrierPayload = {
            enticarr: entityId,
            carrlice: idNumber,
            carrtype: type,
        }
        const newCarrier = await carrierService.createCarrier(carrierPayload);
        
        if(deviceId) {
            const device = await deviceService.getDevice({ devinuid: deviceId });
            if (!device) throw 'El dispositivo que intenta asociar no existe';
            const carrdeviPayload = {
                carrcade: newCarrier.carrnuid,
                devicade: deviceId
            }

            const carridevi = await carrierService.getCarriDevi({devicade: deviceId})
            if (carridevi) throw 'El dispositivo ya esta vinculado a otro vehiculo'
            await carrierService.createCarriDevi(carrdeviPayload);
        }

        await t.commit()

        res.status(200).json({
            ok: true,
            response: newCarrier
        }) 
    } catch (error) {
        await t.rollback();
        console.log(error)
        res.status(500).json({
            message: error instanceof ReferenceError ? error.message : error
        }) 
    }
}

const getCarriers = async (req, res) => {
    try {
        const { entityId } = req.params;
        const { limit, offset} = req.query;
        const pagination = {
            limit: Number(limit) || 10,
            offset: Number(offset) || 0
        }
        const carriers = await carrierService.getCarriers(entityId, pagination);
    
        res.status(200).json({
            ok: true,
            response: carriers
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
    
}

const updateCarrier = async (req, res) => {
    try {
        const carrierId = Number(req.params.carrierId)
        const { idNumber, type, deviceId } = req.body;
        const carrier = await carrierService.getCarrier({ carrnuid: carrierId });
        if(!carrier) throw 'Vehiculo no existe';
        if(carrier.carrlice != idNumber){
            const exists = await carrierService.getCarrier({ enticarr: carrier.enticarr, carrlice: idNumber });
            if(exists) throw 'Este vehiculo ya existe en tu entidad';
        }
        
        const payloadCarrier = {
            carrtype: type || carrier.carrtype,
            carrlice: idNumber || carrier.carrlice
        }
        const updatedCarrier = await carrierService.updateCarrier(carrierId, payloadCarrier);
        if(deviceId) {
            console.log({deviceId})
            const device = await deviceService.getDevice({ devinuid: deviceId });
            if (!device) throw 'El dispositivo que intenta asociar no existe';
            const deviceExists = await carrierService.getCarriDevi({devicade: deviceId})   
            const carrierExists = await carrierService.getCarriDevi({carrcade: carrierId})            
            const carrdeviPayload = {
                carrcade: carrierId,
                devicade: deviceId
            }
            if(deviceExists){
                await carrierService.updateCarriDevi(deviceExists.cadenuid, carrdeviPayload);
            } else if(carrierExists) {
                await carrierService.updateCarriDevi(carrierExists.cadenuid, carrdeviPayload);
            }else {
                await carrierService.createCarriDevi(carrdeviPayload);
            }
            // if(!carridevi) await carrierService.createCarriDevi(carrdeviPayload);
            // if (carridevi  && carridevi.carrcade !== carrierId){
            //     throw 'El dispositivo ya esta vinculado a otro vehiculo';
            // } else {
            //     console.log(carridevi)
            //     await carrierService.updateCarriDevi(carridevi.cadenuid, carrdeviPayload);
            // }
        }
        const newCarrier = await carrierService.getCarrier({carrnuid: carrierId});

        res.status(200).json({
            ok: true,
            response: newCarrier
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
    
}

const deleteCarrier = async (req, res) => {
    try {
        const { carrierId } = req.params;
        const carrier = await carrierService.getCarrier({ carrnuid: carrierId })
        if(!carrier) throw 'Vehiculo no existe';
        await carrierService.deleteCarrierDevice(carrierId)
        await carrierService.deleteCarrier(carrierId);

        res.status(200).json({
            ok: true,
            message: 'Carrier eliminado'  
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
}

module.exports = {
    createCarrier,
    getCarriers,
    updateCarrier,
    deleteCarrier
}