const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(taskSchema = new Schema({
    task_id: Number,
    task_title: String,
    task_description: String,
    big_description: String,
    task_category: String,
    advanceTask: Boolean,
    sheetData: [{userId: {
      type: Number,
      default: 0
    }, sheetId: {
      type: Number,
      default: 1
    }}]
})),
  (Task = mongoose.model("Task", taskSchema));

module.exports = Task;
