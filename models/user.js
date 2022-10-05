const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(userSchema = new Schema({
  unique_id: Number,
  email: String,
  username: String,
  school: String,
  fullname: String,
  age: Number,
  competitor_id: String,
  grade: String,
  password: String,
  passwordConf: String,
  adminUser: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bitsUser: Boolean,
  hypertextUser: Boolean,
  admissionNo: Number
})),
  (User = mongoose.model("User", userSchema));

module.exports = User;
