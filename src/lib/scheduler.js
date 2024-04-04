const cron = require('node-cron');
const work = require('../controllers/travel.controller');

cron.schedule('5 0 * * *', async () => {
  console.log('Ejecutando tarea...');
  await work.workCalculateAllDevices();
  console.log('Tarea completada.');
});