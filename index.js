'use strict';
const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const { SessionsClient } = require('@google-cloud/dialogflow');

const app = express();
const port = process.env.PORT || 10000;
const projectId = 'renaceai-bot-ysvq';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionClient = new SessionsClient();

app.post('/', async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  const from = req.body.From;
  const text = req.body.Body;

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, from);
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode: 'es' }
    }
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    const reply = response.queryResult.fulfillmentText;
    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (e) {
    console.error(e);
    res.status(500).send(`<Response><Message>Lo siento, ocurrió un error 😞</Message></Response>`);
  }
});

app.listen(port, () => console.log(`Servidor escuchando en puerto ${port}`));
