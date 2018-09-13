const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const { 
  validatePasswordLength, 
  validatePasswordFormat 
} = require("./validations");

const validators = [
  {validator: validatePasswordLength, msg: "Password must be atleast 8 characters."},
  {validator: validatePasswordFormat, msg: "Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character."}
];

const userSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true, validate: validators},
  polls: [{type: Schema.Types.ObjectId, ref: "Poll"}]
});


userSchema.pre("save", function(next) {
  if (!this.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
  next();
});

module.exports = userSchema;