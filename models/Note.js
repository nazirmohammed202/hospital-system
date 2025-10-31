const mongoose = require("mongoose");
const Joi = require("joi");

const schema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    encryptedNote: { type: String, required: true },
    iv: { type: String, required: true },
    encryptedAESKeyForPatient: { type: String, required: true },
    encryptedAESKeyForDoctor: { type: String, required: true },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", schema);

module.exports.validateNote = (note) => {
  const schema = Joi.object({
    note: Joi.string().required(),
  });

  return schema.validate(note);
};

module.exports.Note = Note;
