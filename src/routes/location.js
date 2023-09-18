const express = require('express');
const app = express();
const { verificaToken, validateSchema } = require('../middlewares/autenticacion');
const { createLocation, getDevicePositions, createLocationsFromRedis } = require('../controllers/location.controller');
const { GetLocationsSchema } = require('../schemas/location.schema');



// ===============================
// LOCATION
// ===============================

app.post('/', verificaToken, createLocation);

app.post('/from-redis/', verificaToken, createLocationsFromRedis);

app.post('/getDevicePositions/entity/:entityId', [verificaToken, validateSchema(GetLocationsSchema)], getDevicePositions);






module.exports = app;