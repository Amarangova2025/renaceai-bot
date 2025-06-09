'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { SessionsClient } = require('@google-cloud/dialogflow');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 10000;

// Cargar las credenciales desde la variable de entorno
let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} catch (error) {
  console.error('No se pudieron cargar las credenciales:', error);
  process.exit(1);
}

const sessionClient = new SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, '\n')
  },
  projectId: credentials.project_id,
});

const projectId = credentials.project_id;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Ruta Webhook
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
    const reply = result.fulfillmentText || 'Lo siento, no entendí eso.';

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(reply);

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error con Dialogflow:', error);

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Ocurrió un error al procesar tu mensaje. Intenta nuevamente.');

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

app.listen(port, () => {
  console.log(`Renace AI escuchando en el puerto ${port}`);
});
