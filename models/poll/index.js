const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// pollSchema = new Schema({
//   prompt: {type: string, required: true}
// });

pollSchema = new Schema({
  prompt: { type: String, required: true }
});

module.exports = mongoose.model("Polls", pollSchema);