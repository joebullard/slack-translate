var fs = require('fs');
var Botkit = require('botkit');
var Translate = require('@google-cloud/translate');
var config = require('./config.json');

if (!config.SLACK_TOKEN) {
  console.log('ERROR: Must define SLACK_TOKEN in config.json');
  process.exit(1);
}

if (!config.TARGET_LANG_CODE) {
  console.log('ERROR: Must define TARGET_LANG_CODE in config.json');
  process.exit(1);
}

Translate().getLanguages().then(function (data) {
  var codes = data[0].map((lang) => lang.code);
  if (codes.indexOf(config.TARGET_LANG_CODE) < 0) {
    console.log(`ERROR: Invalid TARGET_LANG ${config.TARGET_LANG_CODE}`);
    process.exit(1);
  }
});

var controller = Botkit.slackbot({debug: false});

controller
  .spawn({token: config.SLACK_TOKEN})
  .startRTM((err) => {
    if (err)
      throw new Error(err)
  });

controller.on('channel_joined', (bot, msg) => {
  console.log(msg);
  bot.reply(msg, "Hello! I'm here to translate messages into English.\n" + 
                 "こんにちは！私はメッセージを英語に翻訳してます。");
});

controller.on(['direct_mention', 'direct_message'], (bot, msg) => {
  Translate().translate(msg.text, config.TARGET_LANG_CODE)
    .then((results) => {
      bot.reply(msg, results[0]);
    })
    .catch((err) => {
      console.log(err);
      bot.reply(msg, 'Sorry, I fucked that one up');
    })
});
