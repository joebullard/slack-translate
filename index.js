'use strict';

const config = require('./config.json');
const Translate = require('@google-cloud/translate');

/**
 * Handle incoming messages from Slack
 */
exports.translate = function(req, res) {
  return Promise.resolve()
    .then(() => {
      validateRequest(req);
      return Translate().translate(req.body.text, req.query.lang);
    })
    .then((results) => {
      res.json(formatSlackMessage(req.body.text, results[0]));
    })
    .catch((err) => {
      res.status(err.code || 500);
      res.json({message: err.message});
    })
}

/**
 * Require POST method, `lang` query param, and verify that the request is
 * coming from the right Slack team.
 */
function validateRequest (req) {
    if (req.method != 'POST')
      makeError('Only POST requests are accepted', 405);

    if (!req.query.lang || !config[req.query.lang])
      makeError('Invalid `lang` query parameter', 400);

    if (!req.body || req.body.token !== config[req.query.lang].SLACK_TOKEN)
      makeError('Invalid credentials', 401);
}

/**
 * Format the final results for posting in Slack
 */
function formatSlackMessage(text, translation) {
  return {
    response_type: 'ephemeral',
    attachments: [
      {
        color: 'good',
        text: text
      },
      {
        color: 'good',
        text: translation
      }
    ]
  }
}

/**
 * Build a generic error
 */
function makeError(message, code) {
  const error = new Error(message);
  error.code = code;
  throw err;
}

