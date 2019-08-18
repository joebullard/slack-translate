const { detectLanguage, translate } = require('./googleTranslate');

describe('Google Translate API wrapper', () => {
  describe('Language detection', () => {
    test('Valid input', async () => {
      expect.assertions(1);

      // We shouldn't really expect the API to return a specific result in general,
      // but in this case I think we can be confident that it will detect Japanese.
      const text = 'これは日本語の文章です！';
      const expectedResult = 'ja';

      const detectedLanguage = await detectLanguage(text);
      expect(detectedLanguage).toBe(expectedResult);
    });

    test('Empty-string input', async () => {
      expect.assertions(1);

      const text = '';
      const expectedResult = undefined;

      const detectedLanguage = await detectLanguage(text);
      expect(detectedLanguage).toBe(expectedResult);
    });
  });

  describe('Translation', () => {
    test('Valid input', async () => {
      expect.assertions(1);

      // Don't expect a specific result, as Translate API may change behavior.
      const text = 'Helloøj!';
      const targetLanguage = 'en';
      const expectedType = 'string';

      const translatedText = await translate(text, targetLanguage);
      expect(typeof translatedText).toBe(expectedType);
    });

    test('Empty-string input', async () => {
      expect.assertions(1);

      const text = '';
      const targetLanguage = 'ja';
      const expectedResult = '';

      const translatedText = await translate(text, targetLanguage);
      expect(translatedText).toBe(expectedResult);
    });
  });
});
