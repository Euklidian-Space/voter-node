const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { validateCandidatesLength } = require("./validations.js");

pollSchema = new Schema({
  prompt: { type: String, required: true },
  candidates: {
    type: [{
      cand_id: {type: Schema.Types.ObjectId, ref: "Candidate"},
      vote_count: {type: Number, default: 0}
    }],
    validate: [validateCandidatesLength, "A poll must have atleast 2 candidates"]
  },
  user: {type: Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});

module.exports = mongoose.model("Polls", pollSchema);