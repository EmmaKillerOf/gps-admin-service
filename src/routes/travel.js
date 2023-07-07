const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { getTravel, getTravelTemp, workCalculateAllDevices } = require('../controllers/travel.controller')



// ===============================
//ENTITY
// ===============================

app.get('/:deviceId/:dateSelected', verificaToken, getTravel);

app.get('/temp/:deviceId/:dateInit/:dateFinal', verificaToken, getTravelTemp);

app.get('/work/', verificaToken, workCalculateAllDevices);

/* app.post('/', verificaToken, createEntity);

app.patch('/:entityId', verificaToken, updateEntity);

app.delete('/:entityId', verificaToken, deactiveEntity);
 */





module.exports = app;