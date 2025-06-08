'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

const { WebhookClient } = require('dialogflow-fulfillment');
const { SessionsClient } = require('@google-cloud/dialogflow');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionClient = new SessionsClient();
const projectId = 'renaceai-bot-ysvq'; // ⚠️ Asegúrate que sea tu ID de proyecto real

app.post('/', async (req, res) => {
  const message = req.body.Body;
  const phone = req.body.From;

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, phone);

  const requestDialogflow = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'es',
      },
    },
  };

  try {
    const [response] = await sessionClient.detectIntent(requestDialogflow);
    const fulfillmentText = response.queryResult.fulfillmentText;

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${fulfillmentText}</Message></Response>`);
  } catch (error) {
    console.error("Error al contactar con Dialogflow:", error);
    res.status(500).send(`<Response><Message>Ocurrió un error al procesar tu mensaje</Message></Response>`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
