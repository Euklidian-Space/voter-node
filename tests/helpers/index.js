const http_mocks = require("node-mocks-http");

exports.connectToTestDB = () => {
  const { DB_URL, NODE_ENV: ENV } = require('../../config');
  const mongoose = require('mongoose');

  return mongoose.connect(DB_URL, {promiseLibrary: global.Promise})
    .then(() => {
      return Promise.resolve(mongoose.connection);
    }, reason => Promise.reject(reason));
};

exports.disconnectAndClearTestDB = (db, collection) => {
  return db.dropCollection(collection)
    .then(() => {
      return db.close()
        .then(() => Promise.resolve(null), reason => Promise.reject(reason));
    }, reason => {
      const { message } = reason;
      if (message === "ns not found") {
        return Promise.reject("No collection to clear. Perhaps already dropped.");
      }

      return Promise.reject(reason);
    });
};

exports.buildResp = () => {
  return http_mocks.createResponse({
    eventEmitter: require("events").EventEmitter
  });
};

exports.createRequest = opts => {
  return http_mocks.createRequest(opts);
};