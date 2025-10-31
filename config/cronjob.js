const { Reminder } = require("../models/Reminder");

/**
 * This cron job logs reminders that are due.
 * It runs every minute.
 */
module.exports.logReminders = async () => {
  console.log("Logging reminders");
  const now = new Date();
  const reminders = await Reminder.find({
    scheduledDateTime: { $lte: now },
    logged: false,
  });

  for (let reminder of reminders) {
    console.log(`Reminder: ${reminder.task} for Patient ${reminder.patientId}`);

    reminder.logged = true;
    await reminder.save();
  }
};

/**
 * This cron job reschedules reminders that were missed.
 * It runs every minute.
 * If a reminder is missed, it is rescheduled to the next reminder time.
 */
module.exports.rescheduleReminders = async () => {
  console.log("Rescheduling reminders");
  const now = new Date();
  // Find missed reminders
  let missedReminders = await Reminder.find({
    scheduledDateTime: { $lt: now },
    completed: false,
    logged: true,
  }).populate("plan");

  //filter out reminders where scheduledDateTime plus minutesBetweenReminders is less than now
  missedReminders = missedReminders.filter((reminder) => {
    const nextScheduledTime = new Date(reminder.scheduledDateTime);
    nextScheduledTime.setMinutes(
      nextScheduledTime.getMinutes() + reminder.plan.minutesBetweenReminders
    );
    return nextScheduledTime < now;
  });

  for (let reminder of missedReminders) {
    const lastReminderTime = reminder.plan.startDateTime;

    // Calculate the next scheduled time by adding minutesBetweenReminders to last reminder time
    const minutesBetweenReminders = reminder.plan.minutesBetweenReminders;
    let nextScheduledTime = new Date(lastReminderTime);
    nextScheduledTime.setMinutes(
      nextScheduledTime.getMinutes() + minutesBetweenReminders
    );

    console.log(`Rescheduling missed reminder: ${reminder.task}`);

    // Update the reminder with the new time
    reminder.scheduledDateTime = nextScheduledTime;
    reminder.rescheduledCount += 1;
    await reminder.save();
  }
};
