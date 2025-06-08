'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

const { SessionsClient } = require('@google-cloud/dialogflow');
const sessionClient = new SessionsClient();

const projectId = 'renaceai-bot-ysvq'; // Asegúrate que sea correcto

app.use(express.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
  const userMessage = req.body.Body;
  const userNumber = req.body.From;

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, userNumber);

  const requestDialogflow = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: 'es',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(requestDialogflow);
    const fulfillmentText = responses[0].queryResult.fulfillmentText;

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${fulfillmentText}</Message></Response>`);
  } catch (error) {
    console.error('❌ Error al conectar con Dialogflow:', error);
    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>Lo siento, ocurrió un error 😔</Message></Response>`);
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
});
