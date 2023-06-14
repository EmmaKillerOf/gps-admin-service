const express = require('express');
const jwt = require('jsonwebtoken'); // es para general el TOKEN

const { verificaToken } = require('../middlewares/autenticacion');
const { login } = require('../controllers/auth.controller')


const app = express();

app.post('/login', login);



module.exports = app;