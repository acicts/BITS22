const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(testSchema = new Schema({
    test_id: Number,
    test_name: String,
    test_description: String,
    test_link: String,
    test_grade: String,
    createdAt: { 
      type:Date, 
      default: Date.now() 
    },
    testEnabled: Boolean,
    test_type: String
})),
  (Test = mongoose.model("Test", testSchema));

module.exports = Test;
