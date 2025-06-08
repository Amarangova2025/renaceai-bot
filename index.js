'use strict';

const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'renaceai-bot-ysvq-fdc8b8d49c9c.json');

const sessionClient = new SessionsClient();
const projectId = 'renaceai-bot-ysvq';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/', async (req, res) => {
  const from = req.body.From || 'anon';
  const text = req.body.Body || 'Hola';

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, from);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode: 'es',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    const fulfillmentText = result.fulfillmentText || 'Lo siento, no entendí eso 😞';

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${fulfillmentText}</Message></Response>`);
  } catch (error) {
    console.error('💥 Error al procesar el intent:', error.message);
    res.status(500).send(`<Response><Message>Lo siento, ocurrió un error 😔</Message></Response>`);
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
});
