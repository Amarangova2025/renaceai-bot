'use strict';

const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 10000;

// Middleware para leer datos POST de Twilio
app.use(express.urlencoded({ extended: true }));

// Configura el cliente de Dialogflow
const sessionClient = new SessionsClient();
const projectId = 'renaceai-bot-ysvq';

app.post('/', async (req, res) => {
  const userMessage = req.body.Body;
  const sessionId = req.body.From;

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

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
    const result = responses[0].queryResult;
    const reply = result.fulfillmentText || "Lo siento, no entendí eso 😔";

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${reply}</Message></Response>`);
  } catch (error) {
    console.error('Error al procesar mensaje:', error.message);
    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>Lo siento, ocurrió un error 😓</Message></Response>`);
  }
});

app.listen(port, () => {
  console.log(`🟢 Servidor escuchando en el puerto ${port}`);
});
