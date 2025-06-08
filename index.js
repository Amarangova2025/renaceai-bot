'use strict';

const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 10000;

const projectId = 'renaceai-bot-ysvq'; // Asegúrate que este es el ID correcto de tu agente
const sessionClient = new SessionsClient();

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
    const fulfillmentText = result.fulfillmentText || 'Lo siento, no entendí eso.';

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${fulfillmentText}</Message></Response>`);
  } catch (error) {
    console.error('Error al procesar el intent:', error);
    res.status(500).send(`<Response><Message>Ocurrió un error 😞</Message></Response>`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
