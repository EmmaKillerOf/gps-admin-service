const cron = require('node-cron');
const work = require('../controllers/travel.controller'); // Asegúrate de reemplazar 'tuArchivoConLaFuncion' con la ruta correcta

// Programa la tarea para ejecutarse todos los días a las 11:30 pm
cron.schedule('5 0 * * *', async () => {
  console.log('Ejecutando tarea...');
  await work.workCalculateAllDevices();
  console.log('Tarea completada.');
});