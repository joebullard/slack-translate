import Translate from '@google-cloud/translate';
import config from './config';

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

export {
  detectLanguage,
  translate,
};
