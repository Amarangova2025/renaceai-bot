'use strict';

// commit for Render redeploy test

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { SessionsClient } = require('@google-cloud/dialogflow');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

const sessionClient = new SessionsClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  const message = req.body.Body;
  const from = req.body.From;
  const sessionPath = sessionClient.projectAgentSessionPath(process.env.GOOGLE_PROJECT_ID, from);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'es',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const reply = responses[0].queryResult.fulfillmentText || 'Lo siento, no entendí eso.';

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(reply);

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error:', error);
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Ocurrió un error procesando tu mensaje.');

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

app.listen(port, () => {
  console.log(`Renace AI escuchando en el puerto ${port}`);
  
});
