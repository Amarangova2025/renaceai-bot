'use strict';

GOOGLE_APPLICATION_CREDENTIALS = renaceai-bot-ysvq-fdc8b8d49c9c.json

const express = require('express');
const { SessionsClient } = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🧠 Usa el archivo de autenticación cargado como variable de entorno
const sessionClient = new SessionsClient();

const projectId = 'renaceai-bot-ysvq';

app.post('/', async (req, res) => {
    const twilioMessageBody = req.body.Body;
    const twilioFromNumber = req.body.From;

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, twilioFromNumber);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: twilioMessageBody,
                languageCode: 'es',
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const fulfillmentText = responses[0].queryResult.fulfillmentText;

        res.set('Content-Type', 'text/xml');
        res.send(`<Response><Message>${fulfillmentText}</Message></Response>`);
    } catch (error) {
        console.error('ERROR:', error);
        res.set('Content-Type', 'text/xml');
        res.send(`<Response><Message>Lo siento, ocurrió un error 😓</Message></Response>`);
    }
});

app.listen(port, () => {
    console.log(`✅ Servidor escuchando en puerto ${port}`);
});
