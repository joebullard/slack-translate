var Botkit = require('botkit');
var Translate = require('@google-cloud/translate')({
    keyFilename: process.env.GOOGLE_CREDENTIALS
});

const DEFAULT_GREETING = 'Hello! My name is <@me>!'
const DEFAULT_APOLOGY = 'Sorry! I had some trouble translating your message.'

// Check if target language is supported
Translate.getLanguages()
  .then((data) => {
    var codes = data[0].map((lang) => lang.code);

    if (codes.indexOf(process.env.TARGET_LANG) < 0) {
      console.log(`ERROR: Invalid target language ${process.env.TARGET_LANG}`);
      process.exit(1);
    }
  });

var controller = Botkit.slackbot({debug: process.env.DEBUG || false});

controller
  .spawn({token: process.env.BOT_TOKEN})
  .startRTM((err) => {
    if (err)
      throw new Error(err)
  });

controller.on('channel_join', (bot, msg) => {
  var greeting = process.env.GREETING || DEFAULT_GREETING;

  bot.replyPublic(msg, greeting.replace(/<@me>/g, '<@' + bot.name + '>'));
});

controller.on(['mention', 'direct_mention', 'direct_message'], (bot, msg) => {
  Translate.translate(msg.text, process.env.TARGET_LANG)
    .then((results) => {
      var translation = results[0];
      var mentions = translation.match(/<@[^>]+>/g);

      if (mentions) {
        mentions.forEach((m) => {
          translation = translation.replace(m, m.replace(/ /g, ''))
        });
      }

      bot.reply(msg, translation);
    })
    .catch((err) => {
      console.log(err);
      bot.reply(msg, process.env.APOLOGY || DEFAULT_APOLOGY);
    })
});