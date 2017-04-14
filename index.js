'use strict';

const config = require('./config.json');
const googleTranslate = require('@google-cloud/translate')();

exports.translate = function(req, res) {
  return Promise.resolve()
    .then(() => {
      validateRequest(req);
      return makeTranslateRequest(req.body.text, req.query.lang);
    })
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      res.status(err.code || 500);
      res.json({message: err.message});
    })
}

function validateRequest (req) {
  console.log(req);
    if (req.method != 'POST') {
      const error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    if (!req.query.lang || !config[req.query.lang]) {
      const error = new Error('Invalid `lang` query parameter');
      error.code(400);
      throw error;
    }

    if (!req.body || req.body.token !== config[req.query.lang].SLACK_TOKEN) {
      const error = new Error('Invalid credentials');
      error.code = 401;
      throw error;
    }
}

function makeTranslateRequest(text, lang) {
  return new Promise((resolve, reject) => {
    googleTranslate.translate(text, lang, (err, translation) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      resolve(formatSlackMessage(text, translation));
    });
  });
}

function formatSlackMessage(text, translation) {
  return {
    response_type: 'ephemeral',
    attachments: [
      {
        title: "Input",
        text: text
      },
      {
        title: "Output",
        text: translation
      }
    ]
  }
}


