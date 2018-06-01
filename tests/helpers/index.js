const http_mocks = require("node-mocks-http");
const faker = require("faker");
const { map, flow, range } = require("lodash/fp");
const { passwordREGEX } = require("../../models/user/validations");
const { to } = require("await-to-js");

exports.connectToTestDB = () => {
  const { DB_URL, NODE_ENV: ENV } = require('../../config');
  const mongoose = require('mongoose');

  return mongoose.connect(DB_URL, {promiseLibrary: global.Promise})
    .then(() => {
      return Promise.resolve(mongoose.connection);
    }, reason => Promise.reject(reason));
};

exports.disconnectTestDB = db => {
  return db.close();
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

exports.clearDBCollection = async (db, collection) => {
  return db.dropCollection(collection)
    .then(() => {
      return Promise.resolve(`${collection} collection dropped`);
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

exports.seedUsers = count => {
  const users = createFakeUsers(count);
  return seedFunc => seedFunc(users);
};

exports.generateMongoIDs = count => {
  const MongoID = require("mongodb").ObjectId;
  return flow(
    range(count),
    map(() => new MongoID())
  )(0);
};  

function createFakeUsers(count) {
  const fakeUser = () => {
    return {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: "pAssword1234!"
    };
  };

  return flow(
    range(count), 
    map(fakeUser)
  )(0);
}