const {
  generateKeyPairSync,
  publicEncrypt,
  privateDecrypt,
} = require("crypto");

const crypto = require("crypto");
const { geminiFlash } = require("../../../config/gemini");
const { Reminder } = require("../../../models/Reminder");
const { Plan } = require("../../../models/Plan");

module.exports.generateKeys = () => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
};

module.exports.encryptNote = (patientPublicKey, doctorPublicKey, note) => {
  // Generate a random AES key
  const aesKey = crypto.randomBytes(32); // 256-bit key

  // Encrypt note using AES
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encryptedNote = cipher.update(note, "utf8", "hex");
  encryptedNote += cipher.final("hex");

  // Encrypt AES key with both patient and doctor public keys
  const encryptedAESKeyForPatient = publicEncrypt(
    patientPublicKey,
    aesKey
  ).toString("base64");
  const encryptedAESKeyForDoctor = publicEncrypt(
    doctorPublicKey,
    aesKey
  ).toString("base64");

  return {
    encryptedNote,
    iv: iv.toString("hex"), // Store IV for decryption
    encryptedAESKeyForPatient,
    encryptedAESKeyForDoctor,
  };
};

module.exports.decryptNote = (
  privateKey,
  encryptedNote,
  iv,
  encryptedAESKey
) => {
  // Decrypt AES key using private key
  const aesKey = privateDecrypt(
    privateKey,
    Buffer.from(encryptedAESKey, "base64")
  );

  // Decrypt note using AES
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    aesKey,
    Buffer.from(iv, "hex")
  );
  let decryptedNote = decipher.update(encryptedNote, "hex", "utf8");
  decryptedNote += decipher.final("utf8");

  return decryptedNote;
};

// Extract Checklist & Plan from Doctor Notes using Gemini Flash
module.exports.processDoctorNote = async (note) => {
  //   const prompt = `Extract actionable steps from this doctor note:\n\n${note}\n\nReturn a JSON object with 'checklist' (immediate tasks) and 'plan' (scheduled actions).`;

  const prompt = `Extract actionable steps from this doctor note:\n\n${
    note + "Today is :" + new Date().toLocaleString()
  }\n\n return a JSON object with 'checklist' (immediate tasks) and 'plan' (scheduled actions. Example if note contains prescription to be taken twice daily for seven days, we add plans to take the medicine in the morning, another in the evening for that day. We do same for subsequent days till all seven days are done) using this schema: { "checklist": [], "plan": [{scheduledDateTime: Date, task:String,completed: Boolean, minutesBetweenTasks:Number ] }`;
  const result = await geminiFlash.generateContent(prompt);

  const responseText = result.response.text();
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    return { checklist: [], plan: [] }; // Default empty values in case of failure
  }
};

// Schedule reminders for patient based on Doctor's note
module.exports.scheduleReminders = async (patientId, plan) => {
  await Reminder.deleteMany({ patientId }); // Remove old reminders
  await Plan.deleteMany({ patient: patientId }); // Remove old plan

  const reminders = plan.map((item) => {
    return {
      patientId,
      scheduledDateTime: new Date(item.scheduledDateTime),
      task: item.task,
      completed: false,
      logged: false,
    };
  });

  let planModel = null;

  if (plan[0])
    planModel = new Plan({
      patient: patientId,
      startDateTime: new Date(plan[0]?.scheduledDateTime),
      endDateTime: new Date(plan[plan.length - 1]?.scheduledDateTime),
      minutesBetweenReminders: plan[0]?.minutesBetweenTasks || 0,
    });

  reminders.forEach((reminder) => {
    reminder.plan = planModel._id;
  });

  return [reminders, planModel];
};
