const mongoose = require('mongoose');
const pollSchema = require("../../schemas/poll");

module.exports = mongoose.model("Polls", pollSchema);