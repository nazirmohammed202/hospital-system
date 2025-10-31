const { Doctor, Patient } = require("../../config/misc");
const { User } = require("../../models/User");
const { auth, routeHandler } = require("../../startup/expressMiddlewares");

const router = require("express").Router();

router.get(
  "/available-doctors",
  [auth],
  routeHandler(async (req, res) => {
    if (req.user.role !== Patient)
      return res
        .status(403)
        .send("You are not authorized to view this resource");

    const doctors = await User.find({
      role: Doctor,
      patients: { $nin: [req.user._id] },
    }).select("name email");

    res.status(200).send(doctors);
  })
);

router.get("/my-patients", [auth], async (req, res) => {
  if (req.user.role !== Doctor)
    return res.status(403).send("You are not authorized to view this resource");

  const patients = await User.find({
    role: Patient,
    doctor: req.user._id,
  }).select("name email");

  res.status(200).send(patients);
});

module.exports = router;
