var Botkit = require('botkit');
var Translate = require('@google-cloud/translate')({
    keyFilename: process.env.GOOGLE_CREDENTIALS
});

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

controller.on('bot_channel_join', (bot, msg) => {
  if (process.env.GREETING && msg.user === bot.identity.id)
    bot.reply(msg,
        process.env.GREETING.replace(/<@me>/g, '<@' + bot.identity.id + '>'));
});

controller.on(['mention', 'direct_mention', 'direct_message'], (bot, msg) => {
  // Remove our name if not a direct mention so we don't break translation
  // Also a hacky way of dealing with <!channel> group mentions (avoid unicode
  // conversion in translate API for the '!')
  var text = msg.text
              .replace('<@' + bot.identity.id + '>', '')
              .replace(/<!([^>]+)>/, '<@@$1>');

  Translate.translate(text, process.env.TARGET_LANG)
    .then((results) => {
      var translation = results[0];
      var mentions = translation.match(/< ?@[^>]+>/g);

      if (mentions) {
        mentions.forEach((m) => {
          translation = translation.replace(m, m.replace(/ /g, ''))
        });
      }
      translation = translation.replace(/<@@([^>]+)>/, '<!$1>').toLowerCase();
      
      bot.reply(msg, translation);
    })
    .catch((err) => {
      console.log(err);
      bot.reply(msg, process.env.APOLOGY || 'ERROR');
    })
});
