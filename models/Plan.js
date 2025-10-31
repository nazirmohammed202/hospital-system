const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  reminders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reminder" }],
  minutesBetweenReminders: { type: Number, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Plan = mongoose.model("Plan", schema);

module.exports.Plan = Plan;
