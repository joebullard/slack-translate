var env = require('node-env-file');
env(process.env.ENV || '.env')
var fs = require('fs');
var Botkit = require('botkit');
var Translate = require('@google-cloud/translate')({
    keyFilename: process.env.GOOGLE_CREDENTIALS
});

// Need a registered bot with token
if (!process.env.BOT_TOKEN) {
  console.log('ERROR: Must define BOT_TOKEN in environment');
  process.exit(1);
}

// Need to specify a target language
if (!process.env.TARGET_LANG) {
  console.log('ERROR: Must define TARGET_LANG in environemnt');
  process.exit(1);
}

// Target language must be supported
Translate.getLanguages().then(function (data) {
  var codes = data[0].map((lang) => lang.code);

  if (codes.indexOf(config.targetLang) < 0) {
    console.log(`ERROR: Invalid target language ${process.env.TARGET_LANG}`);
    process.exit(1);
  }
});

GREETING = 'Hello! My name is <@me>!';
if (process.env.GREETING)
  GREETING = String(fs.readFileSync(process.env.GREETING))

APOLOGY = 'Sorry! I had some trouble translating your message!'
if (process.env.APOLOGY)
  APOLOGY = String(fs.readFileSync(process.env.APOLOGY))


/******************************************************************************/

// Create the bot
var controller = Botkit.slackbot({debug: process.env.DEBUG || false});

// Connect to RTM
controller
  .spawn({token: process.env.BOT_TOKEN})
  .startRTM((err) => {
    if (err)
      throw new Error(err)
  });

// Introduce ourselves
controller.on('channel_joined', (bot, msg) => {
  bot.replyPublic(msg, GREETING.replace(/<@me>/g, '<@' + bot.name + '>'));
});

// You talkin to me?
controller.on(['direct_mention', 'direct_message'], (bot, msg) => {
  Translate.translate(msg.text, process.env.TARGET_LANG)
    .then((results) => {
      bot.reply(msg, results[0]);
    })
    .catch((err) => {
      console.log(err);
      bot.reply(msg, APOLOGY);
    })
});
