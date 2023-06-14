const moment = require('moment');
const config = require('../config/environment');
const bcrypt = require('bcrypt')

/*
 * Encrypt password 
 */
const encryptPassword = async (password) => {
  return await bcrypt.hash(password, 12);
}

/*
 * Generate aleatory unique temporal password
 */
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
}

/*
 * from some weird format in degrees to decimal :)
 */
const convertPoint = (point) => {
  var integerPart = ~~(Math.round(point)/100),
      decimalPart = (point - (integerPart * 100)) / 60;
  return (integerPart + decimalPart).toFixed(6);
}

/*
 * convert the sign.
 * West and South are negative coordinates.
 */
const toSign = (c) => {
  return c === "S" || c === "W" ? -1 : 1;
}


/*
 * Convert position to decimal points .
 */
const getLocationPoint = (point, cardinatePoint) => {
  const newPoint = toSign(cardinatePoint)  * convertPoint(parseFloat(point));
  return newPoint;
}




module.exports = {
  encryptPassword,
  generatePassword,
  getLocationPoint
}