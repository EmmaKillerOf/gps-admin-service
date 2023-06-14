const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { getDevices, createDevice, updateDevice, deleteDevice, unlinkDevice } = require('../controllers/device.controller')



// ===============================
//DEVICE
// ===============================

app.get('/entity/:entityId', verificaToken, getDevices);

app.post('/entity/:entityId', verificaToken, createDevice);

app.patch('/:deviceId', verificaToken, updateDevice);

app.delete('/:deviceId', verificaToken, deleteDevice);

app.delete('/unlink/:deviceId', verificaToken, unlinkDevice);






module.exports = app;