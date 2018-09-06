const mongoose = require('mongoose');
const pollCandidateSchema = require("../../schemas/poll_candidate");

module.exports = mongoose.model("Candidates", pollCandidateSchema);
