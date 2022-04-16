var express = require('express');
var router = express.Router();

const database = require('../services/database.js');
const textToSpeech = require('../services/speechSynthesis');


const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

var subscriptionKey = "41c94b112a5d4406a958bce5ad1163ac";
var endpoint = "https://api.cognitive.microsofttranslator.com";

// Add your location, also known as region. The default is global.
// This is required if using a Cognitive Services resource.
var location = "global";

/* GET home page. */
router.get('/', (req, res) => {
   res.render('index', { answer: 'Index page' });
});


/* POST result page. */
router.post('/result', (req, res) => {
  const source_language = req.body.source_language;
  const target_language = req.body.target_language;
  const text = req.body.text;

  axios({
    baseURL: endpoint,
    url: '/translate',
    method: 'post',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString(),
    },
    params: {
      'api-version': '3.0',
      'from': source_language,
      'to': target_language,
    },
    data: [{
      'text': text,
    }],
    responseType: 'json',
  }).then(function (response) {
    const values = JSON.stringify(response.data)
    const json_values = JSON.parse(values)

    const data_to_sent = {
      source_text : text,
      target_text : json_values[0]['translations'][0]['text'],
      source_language : source_language,
      target_language : json_values[0]['translations'][0]['to']
    }
    // database.addObject(data_to_sent);
    textToSpeech.example(data_to_sent.target_text);
    res.render('result', { answer: data_to_sent })
  })
});

module.exports = router;