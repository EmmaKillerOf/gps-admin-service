const env = (process.env.NODE_ENV);

let config = {};
switch (env) {
    case 'production':
        config = require('../env/production');
        break;
    case 'development':
        config = require('../env/development');
        break;
    case 'staging':
        config = require('../env/staging');
        break;
}

module.exports = config
