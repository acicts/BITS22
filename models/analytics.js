const mongoose = require("mongoose");
const Schema = mongoose.Schema;

(analyticSchema = new Schema({
    analytics_id: {
        type: Number,
        default: 1043
    },
    total_views: {
        type: Number,
        default: 1
    },
    total_signup: Number,
    coding_tasks: Number,
    design_tasks: Number,
    explore_tasks: Number,
})),
  (Analytics = mongoose.model("Analytics", analyticSchema));

module.exports = Analytics;
