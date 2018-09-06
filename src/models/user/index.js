const mongoose = require('mongoose');
const userSchema = require("../../schemas/user");

module.exports = mongoose.model("Users", userSchema);
