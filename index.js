'use strict';

process.env.GOOGLE_APPLICATION_CREDENTIALS = './renaceai-bot-ysvq-fdc8b8d49c9c.json';

const sessionClient = new SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

const express = require('express');
const app = express();
const port = process.env.PORT || 10000;
const { SessionsClient } = require('@google-cloud/dialogflow');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Configurar credenciales de Dialogflow
const sessionClient = new SessionsClient();
const projectId = 'renaceai-bot-ysvq';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  const message = req.body.Body;
  const from = req.body.From;
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, from);

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
    const result = responses[0].queryResult;
    const reply = result.fulfillmentText;

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error('Error en detectIntent:', error);
    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>Lo siento, ocurrió un error 😔</Message></Response>`);
  }
});

app.listen(port, () => {
  console.log(`Renace AI escuchando en el puerto ${port}`);
});
