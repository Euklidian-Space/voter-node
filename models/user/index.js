const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  passwordHash: {type: String, required: true}
});

userSchema.virtual("password")
  .get(() => this._password)
  .set(val => {
    this._password = val;
    console.log("setting: ", val);
    this.passwordHash = "test";
  })


module.exports = mongoose.model("Users", userSchema);
