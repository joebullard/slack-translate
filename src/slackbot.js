const Botkit = require('botkit');
const config = require('./config');
const { detectLanguage, translate } = require('./googleTranslate');

const { targetLanguage, sourceLanguage, responses } = config.bot;
const controller = Botkit.slackbot({ debug: config.debug });

// Currently there is no preprocessing implemented.
const preprocess = text => text;

const postprocess = (text) => {
  let processedText = text;

  // The `@channel` or `@here` mentions will appear in the API as `<!channel>` and `<!here>`.
  // Translation will sometimes return a full-width exclamation point when translating to
  // Japanese, so we must replace it with the half-width ASCII exclamation point.
  // Additionally, sometimes spaces are returned inside of at-mentions, which must be removed.
  const mentions = processedText.match(/< ?[!！@＠][^>]+>/g);
  if (mentions) {
    mentions.forEach((mention) => {
      const processedMention = mention
        .replace(/ /g, '')
        .replace(/！/, '!')
        .replace(/＠/, '@');
      processedText = processedText.replace(mention, processedMention);
    });
  }

  // Similarly, emojis wrapped in colons, e.g. `:upside_down_face:` will also come back with
  // full-width colons when translating to Japanese. We need to replace those, too.
  const emojis = processedText.match(/[:：] ?([^ ：:]+) ?[:：]/g);
  if (emojis) {
    emojis.forEach((emoji) => {
      const processedEmoji = emoji
        .replace(/ /g, '')
        .replace(/：/g, ':');
      processedText = processedText.replace(emoji, processedEmoji);
    });
  }

  return processedText;
};

const translateMessage = async (bot, message) => {
  // If the bot posted a message containing a mention of itself, don't respond.
  if (message.user === bot.identity.id) return;

  try {
    const messageText = preprocess(message.text);
    const detectedLanguage = await detectLanguage(messageText);

    // Determine which language to translate to, if any.
    let translatedText;
    if (!sourceLanguage || detectedLanguage === sourceLanguage) {
      translatedText = await translate(messageText, targetLanguage);
    } else if (detectedLanguage === targetLanguage) {
      translatedText = await translate(messageText, sourceLanguage);
    }

    if (translatedText) {
      //
      bot.replyInThread(message, postprocess(translatedText));
    } else if (responses.illiterate) {
      bot.replyInThread(message, responses.illiterate);
    }
  } catch (err) {
    console.error(err);
    bot.replyInThread(message, responses.apology || 'ERROR');
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
  // Don't do any explicit reconnect, as the underlying lib will handle it automatically (See Github Issue #1).
  console.error(err);
});

module.exports = run;
