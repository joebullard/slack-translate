var TranslateBot = require('./translate-bot.js');
var Translator = require('./translator.js');

var translator = new Translator(process.env.TGT_LANG,
                                process.env.SRC_LANG,
                                process.env.GOOGLE_CREDENTIALS);

var bot = new TranslateBot(process.env.BOT_TOKEN,
                           translator,
                           process.env.GREETING,
                           process.env.APOLOGY,
                           process.env.ILLITERATE,
                           process.env.DEBUG);

bot.run();
