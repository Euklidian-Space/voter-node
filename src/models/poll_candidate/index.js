const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {validatePollsLength, candidateNameUnique} = require("./validations");

const pollCandidateSchema = new Schema({
  name: {
    type: String, 
    required: true
  },
  polls: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "Poll"
    }],
    required: true,
    validate: [validatePollsLength, "A poll candidate must have atleast 1 poll."]
  }
});

module.exports = mongoose.model("Candidates", pollCandidateSchema);
