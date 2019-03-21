import Botkit from 'botkit';
import config from './config';
import { detectLanguage, translate } from './googleTranslate';

const { targetLanguage, sourceLanguage, responses } = config.bot;
const controller = Botkit.slackbot({ debug: config.debug });

// Remove our name if not a direct mention so we don't break translation
const preprocess = (text, userId) => text
  .replace(`<@${userId}>`, '');
  // .replace(/<!([^>]+)>/, '<@@$1>');

const postprocess = (text) => {
  // Also a hacky way of dealing with <!channel> group mentions (avoid unicode
  // conversion in translate API for the '!')
  let processedText = text;

  const mentions = processedText.match(/< ?@[^>]+>/g);
  if (mentions) {
    mentions.forEach((m) => {
      processedText = processedText.replace(m, m.replace(/ /g, ''));
    });
  }

  return processedText.replace(/：(\w+)：/g, ':$1:');
};

const translateMessage = async (bot, message) => {
  try {
    const messageText = preprocess(message.text, bot.identity.id);
    console.log(messageText);
    const detectedLanguage = await detectLanguage(messageText);
    console.log(detectedLanguage);

    let translatedText;
    if (!sourceLanguage || detectedLanguage === sourceLanguage) {
      translatedText = await translate(messageText, targetLanguage);
    } else if (detectedLanguage === targetLanguage) {
      translatedText = await translate(messageText, sourceLanguage);
    }

    // If we translation failed, and if we have a message set for that, respond accordingly
    if (translatedText) {
      bot.reply(message, postprocess(translatedText));
    } else if (responses.illiterate) {
      bot.reply(message, responses.illiterate);
    }
  } catch (err) {
    console.error(err);
    bot.reply(message, responses.apology || 'ERROR');
  }
};

// Main function for running the bot
const run = () => controller
  .spawn({ token: config.bot.token })
  .startRTM((err, bot, payload) => {
    if (err) {
      console.log(err, payload);
      console.log('Failed to start RTM. Trying to reconnect...');

      setTimeout(run, 30000);
    }
  });

// Optional introduction when joining a new Slack channel
controller.on('bot_channel_join', (bot, message) => {
  if (responses.greeting && message.user === bot.identity.id) {
    bot.reply(message, responses.greeting.replace(/<@me>/g, `<@${bot.identity.id}>`));
  }
});

// Translate certain kinds of messages
controller.on(['mention', 'direct_mention', 'direct_message'], translateMessage);

// Simple reconnect logic
controller.on('rtm_close', (bot, err) => {
  console.error(err);
  return run();
});

export default run;
