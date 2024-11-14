const express = require('express');
const deepl = require('deepl-node');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const authKey = "a1bb0c2e-2741-4a87-b75b-b1215de84b44:fx"; // Replace with your actual key
const translator = new deepl.Translator(authKey);

const translationsFolder = path.join(__dirname, '../', 'translations');
const supportedLanguages = ['en', 'fr', 'de']; // Add more languages as needed

const TranslationService = {
  translations: {},

  async readTranslations() {
    console.log('Reading translations from files...');
    for (const lang of supportedLanguages) {
      const filePath = path.join(translationsFolder, `${lang}.json`);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        this.translations[lang] = JSON.parse(data);
        console.log(`Successfully read translations for ${lang}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`No existing translations found for ${lang}, initializing empty object`);
          this.translations[lang] = {};
        } else {
          console.error(`Error reading ${lang}.json:`, error);
        }
      }
    }
  },

  async writeTranslations(lang) {
    console.log(`Writing translations for ${lang}...`);
    const filePath = path.join(translationsFolder, `${lang}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(this.translations[lang], null, 2));
      console.log(`Successfully wrote translations for ${lang}`);
    } catch (error) {
      console.error(`Error writing translations for ${lang}:`, error);
    }
  },

  async translateAndStore(text, targetLang, key) {
    console.log(`Translating and storing: "${text}" to ${targetLang} with key "${key}"`);
    if (targetLang === 'en') {
      const translatedText = text;
      this.translations[targetLang] = this.translations[targetLang] || {};
      this.translations[targetLang][key] = translatedText;
      await this.writeTranslations(targetLang);
      return translatedText;
    }

    if (this.translations[targetLang] && this.translations[targetLang][key]) {
      console.log(`Found existing translation for ${key} in ${targetLang}`);
      return this.translations[targetLang][key];
    }

    try {
      const result = await translator.translateText(text, null, targetLang);
      const translatedText = result.text;
      this.translations[targetLang] = this.translations[targetLang] || {};
      this.translations[targetLang][key] = translatedText;
      await this.writeTranslations(targetLang);
      console.log(`Successfully translated and stored: ${key} in ${targetLang}`);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },

  async getTranslations(lang, keys) {
    console.log(`Getting translations for ${lang}, keys: ${keys.join(', ')}`);
    const result = {};
    for (const key of keys) {
      if (this.translations[lang] && this.translations[lang][key]) {
        result[key] = this.translations[lang][key];
      }
    }
    console.log(`Translations result:`, result);
    return result;
  },

  async translateAndSave(text, sourceLang, targetLang, key) {
    console.log(`Translating and saving: "${text}" from ${sourceLang} to ${targetLang} with key "${key}"`);
    try {
      await this.readTranslations();

      if (this.translations[targetLang] && this.translations[targetLang][key]) {
        console.log(`Found existing translation for ${key} in ${targetLang}`);
        return this.translations[targetLang][key];
      }

      const result = await translator.translateText(text, sourceLang, targetLang);
      const translatedText = result.text;

      this.translations[targetLang] = this.translations[targetLang] || {};
      this.translations[targetLang][key] = translatedText;
      await this.writeTranslations(targetLang);

      if (!this.translations[sourceLang] || !this.translations[sourceLang][key]) {
        this.translations[sourceLang] = this.translations[sourceLang] || {};
        this.translations[sourceLang][key] = text;
        await this.writeTranslations(sourceLang);
      }

      console.log(`Successfully translated and saved: ${key} in ${targetLang}`);
      return translatedText;
    } catch (error) {
      console.error('Translation and save error:', error);
      throw error;
    }
  }
};

// Initialize translations
TranslationService.readTranslations().catch(error => console.error('Error initializing translations:', error));

// Routes
router.post('/translate', async (req, res) => {
  const { text, targetLang, key } = req.body;

  if (!text || !targetLang || !key) {
    return res.status(400).json({ error: 'Missing text, targetLang, or key in request body' });
  }

  try {
    const translatedText = await TranslationService.translateAndStore(text, targetLang, key);
    res.json({ translation: translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

router.post('/getTranslations', async (req, res) => {
  const { lang, keys } = req.body;

  if (!lang || !Array.isArray(keys)) {
    return res.status(400).json({ error: 'Invalid request format' });
  }

  try {
    await TranslationService.readTranslations();
    const requestedTranslations = await TranslationService.getTranslations(lang, keys);
    res.json({ translations: requestedTranslations });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

router.post('/translateAndSave', async (req, res) => {
  const { text, sourceLang, targetLang, key } = req.body;

  if (!text || !sourceLang || !targetLang || !key) {
    return res.status(400).json({ error: 'Missing text, sourceLang, targetLang, or key in request body' });
  }

  try {
    const translatedText = await TranslationService.translateAndSave(text, sourceLang, targetLang, key);
    res.json({ translation: translatedText });
  } catch (error) {
    console.error('Translation and save error:', error);
    res.status(500).json({ error: 'Translation and save failed' });
  }
});

module.exports = router;
module.exports.TranslationService = TranslationService;