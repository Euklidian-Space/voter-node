// Package Dependencies
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ErrorHandler = require("./src/errors/handler");

// Local Dependencies
const { DB_URL, NODE_ENV: ENV } = require('./config');

// Instantiate Express Server
const app = express();

/**
 * MONGODB CONNECTION
 */

mongoose.connect(DB_URL, (error) => {
  if (error) {
    console.log(`MongoDB connection error: ${error}`);

    // should consider alternative to exiting the app due to db conn issue
    process.exit(1);
  }
});

mongoose.Promise = global.Promise;

const db = mongoose.connection;

/**
 * MIDDLEWARE
 */

// Set security-related HTTP headers (https://expressjs.com/en/advanced/best-practice-security.html#use-helmet)
app.use(helmet());

// Allow access on headers and avoid CORS issues
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Access, Authorization, x-access-token',
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');

    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Access, Authorization, x-access-token',
    );

    return res.status(200).json({});
  }

  next();
});

// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Log every request to the console
app.use(morgan('dev'));

/**
 * ROUTES
 */

// API Routes
const Accounts = require("src/contexts/accounts");
const CMS = require("src/contexts/CMS");
// app.use('/', require('./src/routes/index'));
app.use('/user', require('./src/routes/user_routes')(Accounts));
app.use('/poll', require('./src/routes/poll_routes')(CMS));
app.use(ErrorHandler);

// TODO: Create additional routes as necessary

// Serve static assets and index.html in production
// if (ENV === 'production') {
//   // Serve static assets
//   app.use(express.static('client/build'));

//   // Serve index.html file if no other routes were matched
//   const { resolve } = require('path');

//   app.get('**', (req, res) => {
//     res.sendFile(resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

module.exports = app;
