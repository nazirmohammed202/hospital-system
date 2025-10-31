const { Note } = require("../../models/Note");
const { User } = require("../../models/User");
const { routeHandler, auth } = require("../../startup/expressMiddlewares");
const { decryptNote } = require("../user/abstracts/abstracts");

const router = require("express").Router();

//This route is used to get all notes of a patient
//@access private
//@allowedRoles Doctor and Patient

router.get(
  "/",
  [auth],
  routeHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const patientId = req.query.patientId;

    // Get notes where the user is either a doctor or a patient
    const notes = patientId
      ? await Note.find({ doctor: user._id, patient: patientId })
      : await Note.find({
          $or: [{ doctor: user._id }, { patient: user._id }],
        });

    const decryptedNotes = notes.map((note) => {
      const encryptedAESKey =
        user.role === "Patient"
          ? note.encryptedAESKeyForPatient
          : note.encryptedAESKeyForDoctor;
      return {
        doctor: note.doctor,
        note: decryptNote(
          user.privateKey,
          note.encryptedNote,
          note.iv,
          encryptedAESKey
        ),
      };
    });

    res.status(200).send(decryptedNotes);
  })
);

module.exports = router;
