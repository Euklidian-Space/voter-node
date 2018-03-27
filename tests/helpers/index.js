
exports.connectToTestDB = () => {
  const { DB_URL, NODE_ENV: ENV } = require('../../config');
  const mongoose = require('mongoose');

  return mongoose.connect(DB_URL, {promiseLibrary: global.Promise})
    .then(() => {
      return Promise.resolve(mongoose.connection);
    }, reason => Promise.reject(reason));
}

exports.disconnectAndClearTestDB = (db, collection) => {
  return db.dropCollection(collection)
    .then(() => {
      return db.close()
        .then(() => {
          return Promise.resolve(null);
        }, reason => Promise.reject(reason));
    }, reason => {
      const { message } = reason;
      if (message === "ns not found")
        return Promise.reject("No collection to clear. Perhaps already dropped.");

      return Promise.reject(reason);
    });
}