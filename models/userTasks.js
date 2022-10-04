const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(usertasksSchema= new Schema({
    user_id: Number,
    total_points: Number,
    pending_tasks: [{ task_title: String, task_description: String, task_id: Number, task_category: String }],
    approved_tasks: [{ task_title: String, task_description: String, task_id: Number, task_category: String }],
    declined_tasks: [{ task_title: String, task_description: String, task_id: Number, task_category: String, denial_reason: String }]
})),
  (Usertasks = mongoose.model("Usertasks", usertasksSchema));

module.exports = Usertasks;
