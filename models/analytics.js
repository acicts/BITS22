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
    time_spend: [{ time: Number }],
    total_page_clicks: [{ clicks: Number }],
    total_button_clicks: [{ clicks: Number }],
    total_link_press: [{ clicks: Number }],
    total_mouse_movement: [{ movement: Number }]
})),
  (Analytics = mongoose.model("Analytics", analyticSchema));

module.exports = Analytics;
