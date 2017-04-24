var Translator = require('./translator.js');
var Slackbot = require('./slackbot.js');

var translator = new Translator(process.env.TGT_LANG,
                                process.env.SRC_LANG,
                                process.env.GOOGLE_CREDENTIALS);

var slackbot = new Slackbot(process.env.BOT_TOKEN,
                            translator,
                            process.env.GREETING,
                            process.env.APOLOGY,
                            process.env.ILLITERATE,
                            process.env.DEBUG);

slackbot.run();
