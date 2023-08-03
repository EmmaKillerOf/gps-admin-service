require('./config/environment');

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan')
const cors = require('cors')
var path = require('path')
const fs = require('fs')
const config = require('./config/environment');
const observableDevice = require('./observables/device');
const observableCommands = require('./observables/execcomma');
const https = require('https')
const http = require('http')

const app = express()

//CONFIGURACION PARA SOLICITAR LA IP DEL CLIENTE QUE LLAMA EL API
app.set('trust proxy', true);

// log all requests to access.log
app.use(morgan('common', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

// Actualizacion de cors
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// CONFIGURACION GLOBAL DE RUTAS
app.use(require('./routes/index'));

app.listen(config.PORT, () => {
    console.log('Escuchando en el port:', process.env.PORT || config.PORT);
});

observableDevice.sendDevices('listDevices');
observableCommands.sendCommands('listCommands');
