const mysql = require('mysql2');
const config = require('../config/environment');
const { replaceList } = require('../lib/redis');
const dbConfig = {
    host: config.DB.host,
    user: config.DB.username,
    password: config.DB.password,
    database: config.DB.database,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos exitosa.');

    // Función para consultar la tabla y obtener sus registros actuales
    function getTableData(tableName, callback) {
        const query = `SELECT * FROM ${tableName} where devistat=1`;
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error al consultar la tabla:', error);
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }

    // Función para detectar cambios en la tabla y compararlos con los datos previos
    function checkTableChanges(tableName) {
        let previousData = [];
        function handleChanges() {
            getTableData(tableName, async (error, currentData) => {
                if (error) {
                    console.error('Error al obtener los datos de la tabla:', error);
                    return;
                }
                if (JSON.stringify(currentData) !== JSON.stringify(previousData)) {
                    replaceList(currentData, 'listDevices');
                }
                previousData = currentData;
            });
        }
        const interval = setInterval(handleChanges, 3000); 
    }
    const tableNameToObserve = 'device';
    checkTableChanges(tableNameToObserve);
});
