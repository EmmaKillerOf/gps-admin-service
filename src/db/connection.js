const Sequelize = require('sequelize');

const db = new Sequelize('gps', 'root', '200319', {
  host:'localhost',
  dialect:'mysql',
  //loggin: false
});

export default db.authenticate().then(() => db);;