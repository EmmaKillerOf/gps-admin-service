const Redis = require('ioredis');
const config = require('../config/environment');
const REDIS_HOST = config.REDIS.host;
const REDIS_PORT = config.REDIS.port;

const redisConfig = {
    host: REDIS_HOST,
    port: REDIS_PORT
};

const client = new Redis(redisConfig);

let listMesssages = [];
const listKey = 'listDevices';

client.on('connect', () => {
    console.log('Conectado a Redis');
});
client.on('ready', () => {
    console.log('Cliente listo para recibir comandos Redis');
});
client.on('end', () => {
    console.log('Conexión con Redis cerrada');
});
client.on('error', err => console.log('Redis Client Error', err));

async function pushToList(arr, listName) {
    try {
        await new Promise((resolve, reject) => {
            client.rpush(listName, JSON.stringify(arr), (error, result) => {
                if (error) {
                    console.error('Error pushing to Redis list:', error);
                    reject(error);
                } else {
                    console.log('Elemento insertado en la lista:', arr);
                    resolve(result);
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function replaceList(arr, listName) {
    console.log(arr);
    try {
        // Obtén todos los elementos de la lista en Redis
    const listElements = await client.lrange(listName, 0, -1);

    // Convierte los elementos de la lista de Redis a objetos JavaScript
    const parsedListElements = listElements.map(JSON.parse);

    // Filtra los elementos que no están presentes en el otro array
    const filteredElements = parsedListElements.filter((element) =>
    arr.some((otherElement) => JSON.stringify(otherElement) === JSON.stringify(element))
    );

    // Elimina todos los elementos de la lista en Redis
    await client.del(listName);
    console.log(filteredElements);
    console.log("-----------------");
    // Agrega los elementos filtrados nuevamente a la lista en Redis
    const promises = filteredElements.map((element) =>
      client.rpush(listName, JSON.stringify(element))
    );

    await Promise.all(promises);

    console.log(`Lista "${listName}" actualizada correctamente.`);
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
async function deleteList() {
    try {
        await new Promise((resolve, reject) => {
            client.ltrim(listKey, 1, 0, (error, result) => {
                if (error) {
                    console.error('Error trimming Redis list:', error);
                    reject(error);
                } else {
                    console.log('Lista borrada:', result);
                    resolve(result);
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function getList() {
    return new Promise(async (resolve, reject) => {
        const value = await client.lrange(listKey, 0, -1);
        resolve(value);
    });
}

module.exports = {
    pushToList,
    getList,
    replaceList,
    deleteList
};
