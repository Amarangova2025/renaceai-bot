'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

const bodyParser = require('body-parser');
const { SessionsClient } = require('@google-cloud/dialogflow');
const twilio = require('twilio');

let credentials;
try {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('La variable de entorno GOOGLE_APPLICATION_CREDENTIALS_JSON no está configurada.');
  }
  credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} catch (error) {
  console.error('Error al cargar las credenciales:', error);
  process.exit(1);
}

const sessionClient = new SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, '\n'),
  },
  projectId: credentials.project_id,
});

const projectId = credentials.project_id;

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
    const reply = result.fulfillmentText || 'Lo siento, no entendí eso.';

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(reply);

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error al procesar el mensaje:', error);

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Ocurrió un error al procesar tu mensaje. Inténtalo de nuevo más tarde.');

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

app.listen(port, () => {
  console.log(`Renace AI escuchando en el puerto ${port}`);
});
