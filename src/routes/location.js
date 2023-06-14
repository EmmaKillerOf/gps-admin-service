const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const { createLocation, getDevicePositions } = require('../controllers/location.controller');



// ===============================
// LOCATION
// ===============================

app.post('/', verificaToken, createLocation);

app.post('/getDevicePositions/entity/:entityId', verificaToken, getDevicePositions);






module.exports = app;