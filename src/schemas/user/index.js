const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const { validatePassword } = require("./validations");
const PollSchema = require("../poll");

const userSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  passwordHash: {type: String, required: true},
  polls: [{type: Schema.Types.ObjectId, ref: "Poll"}]
});

userSchema.virtual("password")
  .get(function() { return this._password; })
  .set(function(val) {
    this._password = val;
    validatePassword(val)
      .then(pw => {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(pw, salt);
        this.passwordHash = hash;
      }).catch(err => this.invalidate("passwordHash", err));
  });

module.exports = userSchema;