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
        deleteAllList(listName)
            .then(async result => {
                await newList(arr, listName);
            })
            .catch(error => {
                // Aquí puedes manejar cualquier error que ocurra durante la eliminación
                console.error('Error durante la eliminación:', error);
            });

        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function newList(arr, listName) {
    const promises = arr.map((element) => {
        return new Promise((resolve, reject) => {
            client.rpush(listName, JSON.stringify(element), (error, result) => {
                if (error) {
                    console.error('Error al agregar elemento a la nueva lista:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    });
    await Promise.all(promises);
}

function deleteAllList(listName) {
    return new Promise((resolve, reject) => {
        client.del(listName, (error, result) => {
            if (error) {
                console.error('Error al eliminar la lista:', error);
                reject(error);
            } else {
                console.log(`Lista "${listName}" eliminada con éxito.`);
                resolve(result);
            }
        });
    });
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
