const { Patient } = require("../../config/misc");
const { Reminder } = require("../../models/Reminder");
const { User } = require("../../models/User");
const { auth, routeHandler } = require("../../startup/expressMiddlewares");

const router = require("express").Router();

router.get(
  "/",
  [auth],
  routeHandler(async (req, res) => {
    if (req.user.role !== Patient)
      return res
        .status(403)
        .send("You are not authorized to view this resource");
    const reminders = await Reminder.find({ patientId: req.user._id });
    res.status(200).send(reminders);
  })
);

router.get(
  "/checklist",
  [auth],
  routeHandler(async (req, res) => {
    if (req.user.role !== Patient)
      return res
        .status(403)
        .send("You are not authorized to view this resource");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).send(user.checklist);
  })
);

module.exports = router;
