import dotenv from 'dotenv';

dotenv.config();

const config = {
  debug: true,
  googleTranslate: {
    projectId: process.env.GOOGLE_TRANSLATE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_TRANSLATE_SERVICE_ACCOUNT_JSON,
  },
  bot: {
    token: process.env.BOT_TOKEN,
    targetLanguage: process.env.BOT_TARGET_LANGUAGE,
    sourceLanguage: process.env.BOT_SOURCE_LANGUAGE, // optional
    responses: {
      // Sent when joining a channel for the first time
      greeting: process.env.BOT_GREETING_MESSAGE,
      // Sent when there was an error translating a message
      apology: process.env.BOT_APOLOGY_MESSAGE,
      // Sent when the bot does not speak the input language
      illiterate: process.env.BOT_ILLITERATE_MESSAGE,
    },
  },
};

export default config;
