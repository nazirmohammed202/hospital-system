const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",

  generationConfig: {
    responseMimeType: "application/json",
  },
});

module.exports.geminiFlash = geminiFlash;
