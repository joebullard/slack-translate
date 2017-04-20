var googleTranslate = require('@google-cloud/translate');

function Translator (tgtLang, srcLang, keyFilename) {
  this.tgtLang = tgtLang;
  this.srcLang = srcLang;
  this.client = googleTranslate({keyFilename: keyFilename});
};

Translator.prototype.translate = function (text) {
  return this.client.detect(text)
    .then((result) => {
      var detectedLang = result[0].language;

      if (!this.srcLang || detectedLang === this.tgtLang)
        return this.client.translate(text, this.srcLang);
      else if (detectedLang === this.srcLang)
        return this.client.translate(text, this.tgtLang);
      else
        return Promise.resolve();
    });
};

module.exports = Translator;
