const { default: mongoose } = require("mongoose");
const { auth, routeHandler } = require("../../startup/expressMiddlewares");
const { Doctor, Patient } = require("../../config/misc");
const { User } = require("../../models/User");
const {
  encryptNote,
  processDoctorNote,
  scheduleReminders,
} = require("../user/abstracts/abstracts");
const { validateNote, Note } = require("../../models/Note");
const { initTransaction } = require("../../config/initTransaction");
const { Reminder } = require("../../models/Reminder");
const router = require("express").Router();

//This route is used to create a note
router.post(
  "/:patientId",
  [auth],
  routeHandler(async (req, res) => {
    if (req.user.role !== Doctor)
      return res
        .status(403)
        .send({ message: "You are not authorized to view this resource" });

    const isValidId = mongoose.Types.ObjectId.isValid(req.params.patientId);
    if (!isValidId) return res.status(400).send("Invalid patient id");

    const { error } = validateNote(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const patient = await User.findOne({
      _id: req.params.patientId,
      role: Patient,
    });

    if (!patient) return res.status(404).send({ message: "Patient not found" });

    if (patient.doctor.toString() !== req.user._id.toString())
      return res
        .status(403)
        .send({ message: "You are not authorized to view this resource" });

    const doctor = await User.findById(req.user._id);
    if (!doctor) return res.status(404).send({ message: "Doctor not found" });

    const encryptedNote = encryptNote(
      patient.publicKey,
      doctor.publicKey,
      req.body.note
    );

    const { checklist, plan } = await processDoctorNote(req.body.note);

    patient.checklist = checklist.map((item) => ({
      description: item,
      checked: false,
    }));

    const [reminders, planModel] = await scheduleReminders(patient._id, plan);

    const newNote = new Note({
      doctor: req.user._id,
      patient: req.params.patientId,
      encryptedNote: encryptedNote.encryptedNote,
      iv: encryptedNote.iv,
      encryptedAESKeyForDoctor: encryptedNote.encryptedAESKeyForDoctor,
      encryptedAESKeyForPatient: encryptedNote.encryptedAESKeyForPatient,
    });

    await initTransaction(async (session) => {
      await newNote.save({ session });
      await patient.save({ session });
      await Reminder.insertMany(reminders, { session });
      if (planModel) await planModel.save({ session });
    });

    res.status(200).send({ message: "Note created successfully" });
  })
);

module.exports = router;
