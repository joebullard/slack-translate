var Translator = require('./translator.js');
var Slackbot = require('./slackbot.js');

var translator = new Translator(process.env.TARGET_LANG,
                                process.env.SOURCE_LANG,
                                process.env.GOOGLE_CREDENTIALS);

var slackbot = new Slackbot(process.env.BOT_TOKEN,
                            translator,
                            process.env.GREETING,
                            process.env.APOLOGY,
                            process.env.ILLITERATE,
                            process.env.DEBUG);

slackbot.run();
