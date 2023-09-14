const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { getTravel, getKmTravelTempRoute, workCalculateAllDevices, getTravelMonthly } = require('../controllers/travel.controller')



// ===============================
//ENTITY
// ===============================

app.get('/:deviceId/:dateSelected', verificaToken, getTravel);

app.get('/temp/:deviceId/:dateInit/:dateFinal', verificaToken, getKmTravelTempRoute);

app.get('/work/', verificaToken, workCalculateAllDevices);

app.post('/work/monthly', verificaToken, getTravelMonthly);

/* app.post('/', verificaToken, createEntity);

app.patch('/:entityId', verificaToken, updateEntity);

app.delete('/:entityId', verificaToken, deactiveEntity);
 */





module.exports = app;