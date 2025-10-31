const { default: mongoose } = require("mongoose");
const { Patient, Doctor } = require("../../config/misc");
const { User } = require("../../models/User");
const { auth, routeHandler } = require("../../startup/expressMiddlewares");
const { initTransaction } = require("../../config/initTransaction");

const router = require("express").Router();

/**
 * @description This route is used to select a doctor
 * @access private
 * @allowedRoles Patient
 */
router.put(
  "/select-a-doctor/:doctorId",
  [auth],
  routeHandler(async (req, res) => {
    const isValidId = mongoose.Types.ObjectId.isValid(req.params.doctorId);
    if (!isValidId) return res.status(400).send("Invalid doctor id");

    if (req.user.role !== Patient)
      return res
        .status(403)
        .send({ message: "You are not authorized to view this resource" });

    const doctor = await User.findOne({
      _id: req.params.doctorId,
      role: Doctor,
    });
    if (!doctor) return res.status(404).send({ message: "Doctor not found" });

    const patient = await User.findById(req.user._id);
    if (!patient) return res.status(404).send({ message: "Patient not found" });

    if (patient.doctor)
      return res.status(400).send({
        message: "You already have a doctor selected",
      });

    doctor.patients.push(patient._id);
    patient.doctor = doctor._id;

    await initTransaction(async (session) => {
      await doctor.save({ session });
      await patient.save({ session });
    });

    res.status(200).send({ message: "Doctor selected successfully" });
  })
);

module.exports = router;
