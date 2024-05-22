const env = (process.env.NODE_ENV);

let config = {};
switch (env) {
    case 'production':
        config = require('../env/production');
        break;
    case 'development':
        config = require('../env/production');
        break;
    case 'staging':
        config = require('../env/production');
        break;
}

module.exports = config
