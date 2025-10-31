const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  task: String,
  scheduledDateTime: Date,
  completed: { type: Boolean, default: false },
  logged: { type: Boolean, default: false },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  rescheduledCount: { type: Number, default: 0 },
});

const Reminder = mongoose.model("Reminder", schema);

module.exports.Reminder = Reminder;
