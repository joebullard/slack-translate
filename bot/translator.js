'use strict'
var googleTranslate = require('@google-cloud/translate');

function Translator (tgtLang, srcLang, keyFilename) {
  this.tgtLang = tgtLang;
  this.srcLang = srcLang;
  this.client = googleTranslate({keyFilename: keyFilename});
};

Translator.prototype.translate = function (text) {
  return new Promise((resolve, reject) => {
    this.client.detect(text)
      .then((result) => {
        const detectedLang = result[0].language;

        if (!this.srcLang || detectedLang === this.srcLang)
          return this.client.translate(text, this.tgtLang);
        else if (detectedLang === this.tgtLang)
          return this.client.translate(text, this.srcLang);
        else
          return [undefined]
      })
      .then((results) => resolve(results[0]))
      .catch(reject);
  });
};

module.exports = Translator;
