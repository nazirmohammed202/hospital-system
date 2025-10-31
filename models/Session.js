const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  password: { type: String, required: true },
  codeGenerated: { type: String, required: true },
  codeConfirmed: { type: Boolean, default: false },
  role: { type: String, enum: ["Patient", "Doctor"], required: true },
});

module.exports.Session = mongoose.model("Session", schema);
