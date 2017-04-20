var Botkit = require('botkit');

function preprocess (text, userId) {
  // Remove our name if not a direct mention so we don't break translation
  return text.replace('<@' + userId + '>', '')
             .replace(/<!([^>]+)>/, '<@@$1>');
};

function postprocess (text) {
  // Also a hacky way of dealing with <!channel> group mentions (avoid unicode
  // conversion in translate API for the '!')
  var mentions = text.match(/< ?@[^>]+>/g);

  if (mentions)
    mentions.forEach((m) => { text = text.replace(m, m.replace(/ /g, '')) });

  return text.replace(/<@@([^>]+)>/, '<!$1>').toLowerCase();
};

function TranslateBot (token, translator, greeting, apology, illiterate, debug) {
  this.token = token;
  this.translator = translator;
  this.greeting = greeting;
  this.apology = apology;
  this.illiterate = illiterate;
  this.controller = Botkit.slackbot({debug: this.debug || false});

  this.controller.on('bot_channel_join', (bot, msg) => {
    if (this.greeting && msg.user === bot.identity.id)
      bot.reply(msg, this.greeting.replace(/<@me>/g, '<@'+bot.identity.id+'>'));
  });

  this.controller.on(['mention', 'direct_mention', 'direct_message'], (bot, msg) => {
    this.translator.translate(preprocess(msg.text, bot.identity.id))
      .then((translation) => {
        if (translation)
          bot.reply(msg, postprocess(translation[0]));
        else if (this.illiterate)
          bot.reply(msg, this.illiterate);
      })
      .catch((err) => {
        console.log(err);
        bot.reply(msg, process.env.APOLOGY || 'ERROR');
      })
  });
};

TranslateBot.prototype.run = function () {
  this.controller
    .spawn({token: this.token})
    .startRTM((err) => {
      if (err)
        throw new Error(err)
    });
};

module.exports = TranslateBot;

