const { default: mongoose } = require("mongoose");
const { Reminder } = require("../../models/Reminder");
const { routeHandler, auth } = require("../../startup/expressMiddlewares");

const router = require("express").Router();

router.put(
  "/complete/:reminderId",
  [auth],
  routeHandler(async (req, res) => {
    const isValidId = mongoose.Types.ObjectId.isValid(req.params.reminderId);
    if (!isValidId) return res.status(400).send("Invalid reminder id");

    const reminder = await Reminder.findOne({
      _id: req.params.reminderId,
      patientId: req.user._id,
    });
    if (!reminder)
      return res.status(404).send({ message: "Reminder not found" });

    reminder.completed = true;

    await reminder.save();

    res.status(200).send({ message: "Reminder completed successfully" });
  })
);

module.exports = router;
