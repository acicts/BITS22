const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(confidentialSchema = new Schema({
    power_admin: Number,
    competition_enabled: Boolean,
})),
  (Confidential = mongoose.model("Confidential", confidentialSchema));

module.exports = Confidential;
