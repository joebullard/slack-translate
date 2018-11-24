import Translate from '@google-cloud/translate';
import config from './config';

const {
  projectId,
  keyFilename,
} = config.googleTranslate;

const client = Translate({ projectId, keyFilename });

export const detectLanguage = text => client
  .detect(text)
  .then(result => result[0].language)
  .then(language => (language === 'und' ? undefined : language));

export const translate = (text, targetLanguage) => client
  .translate(text, targetLanguage)
  .then(result => result[0]);
