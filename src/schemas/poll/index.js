const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { validateCandidatesLength, validateUniqueNames } = require("./validations.js");
const validators = [
  {validator: validateCandidatesLength, msg: "A poll must have atleast 2 candidates"},
  {validator: validateUniqueNames, msg: "Candidate names must be unique"}
];

pollSchema = new Schema({
  prompt: { type: String, required: true },
  candidates: {
    type: [{name: {type: String, required: true}, vote_count: {type: Number, default: 0}}],
    validate: validators
  },
  user: {type: Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});

module.exports = pollSchema;