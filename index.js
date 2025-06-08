'use strict';

const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessionClient = new SessionsClient({
  keyFilename: './credentials/dialogflow-key.json',
});

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

app.post('/', async (req, res) => {
  const userMessage = req.body.Body;
  const userNumber = req.body.From;

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, userNumber);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: 'es',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult.fulfillmentText;

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${result}</Message></Response>`);
  } catch (error) {
    console.error('Error:', error);
    res.set('Content-Type', 'text/xml');
    res.send('<Response><Message>Ocurrió un error 😓</Message></Response>');
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor Renace AI activo en el puerto ${port}`);
});
