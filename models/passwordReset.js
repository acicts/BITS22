const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(resetSchema = new Schema({
    user_id: Number,
    reset_link: String,
    expired: Boolean
})),
  (Reset = mongoose.model("Reset", resetSchema));

module.exports = Reset;
