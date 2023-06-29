const express = require('express');
const app = express();

const prefix = '/api';

app.use(`${prefix}/auth`, require('./auth'));
app.use(`${prefix}/user`, require('./user'));
app.use(`${prefix}/entity`, require('./entity'));
app.use(`${prefix}/device`, require('./device'));
app.use(`${prefix}/carrier`, require('./carrier'));
app.use(`${prefix}/classifier`, require('./classifier'));
app.use(`${prefix}/location`, require('./location'));
app.use(`${prefix}/travel`, require('./travel'));

module.exports = app;
