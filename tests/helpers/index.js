const http_mocks = require("node-mocks-http");
const faker = require("faker");
const { map, flow, range } = require("lodash/fp");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Poll = require("../../src/models/poll");
const { JWT_KEY } = require("../../config");

exports.connectToTestDB = db_url => {

  return mongoose.connect(db_url, {promiseLibrary: global.Promise})
    .then(() => {
      return Promise.resolve(mongoose.connection);
    }, reason => Promise.reject(reason));
};

exports.disconnectTestDB = async (connection, db) => {
  await connection.close();
  return db.close();
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

exports.seedPolls = count => {
  const polls = pollDataForDBSeeding(count);
  return seedFunc => seedFunc(polls);
}

exports.generateMongoIDs = count => {
  return flow(
    range(count),
    map(() => createMondoID())
  )(0);
};  

exports.createFakePolls = count => {
  const fakePoll = () => {
    return {
      prompt: faker.lorem.text(),
      candidates: [
        { cand_id: createMondoID(), vote_count: Math.floor(Math.random() * 10) + 1  },
        { cand_id: createMondoID(), vote_count: Math.floor(Math.random() * 10) + 1  }        
      ],
      user: createMondoID()
    };
  };

  return flow(
    range(count),
    map(fakePoll)
  )(0);
};

exports.populateUsers = async count => {
  const users = createFakeUsers(count);
  const insertedUsers = await Promise.all(users.map(u => User.create(u)));
  return insertedUsers.map(user => {
    return Object.assign(user.toObject(), {
      token: jwt.sign({id: user.id}, JWT_KEY, {expiresIn: 500}).toString()
    });
  });
};

exports.populatePolls = async users => {
  const user_count = users.length;
  const polls = await Promise.all(fakePollData(user_count * 2).map(poll => {
    const idx = Math.floor(Math.random() * user_count);
    poll.user = users[idx]._id;
    return Poll.create(poll);
  }));

  await Promise.all(polls.map(poll => {
    const user_id = poll.user.toString();
    const update = {$push: {polls: poll}};
    return User.findByIdAndUpdate(user_id, update);
  }));

  return polls;
};

function createMondoID() {
  const MongoID = require("mongodb").ObjectId;
  return new MongoID();
}

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

function fakePollData(count) {
  const fakePoll = () => {
    return {
      prompt: faker.lorem.text(),
      candidates: [
        { name: faker.name.findName(), vote_count: Math.floor(Math.random() * 10) + 1  },
        { name: faker.name.findName(), vote_count: Math.floor(Math.random() * 10) + 1  }        
      ],
    };
  };

  return flow(
    range(count),
    map(fakePoll)
  )(0);
}

function pollDataForDBSeeding(count) {
  const fakePoll = () => {
    return {
      prompt: faker.lorem.text(),
      candidates: [
        faker.name.findName(), 
        faker.name.findName()
      ],
      user: createMondoID()
    };
  };

  return flow(
    range(count),
    map(fakePoll)
  )(0);
}