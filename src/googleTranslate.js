const Translate = require('@google-cloud/translate');
const config = require('./config');

const {
  projectId,
  keyFilename,
} = config.googleTranslate;

const client = Translate({ projectId, keyFilename });

const detectLanguage = text => client
  .detect(text)
  .then(result => result[0].language)
  .then(language => (language === 'und' ? undefined : language));

const translate = (text, targetLanguage) => client
  .translate(text, targetLanguage)
  .then(result => result[0]);

module.exports = {
  detectLanguage,
  translate,
};
