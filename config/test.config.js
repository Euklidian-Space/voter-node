const SECRETS = require('./secrets.json'); // nodejs will auto read json

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'test',
  HOST: process.env.HOST || 'http://localhost',
  PORT: process.env.PORT || 8081,
  DB_URL: SECRETS.mongodb_test.db_url,
  JWT_KEY: SECRETS.jwt.key,
};
