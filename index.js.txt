'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const { SessionsClient } = require('@google-cloud/dialogflow');
const functions = require('@google-cloud/functions-framework');

const projectId = 'renaceai-bot-jysyq'; // ← Reemplaza si cambia
const sessionClient = new SessionsClient();

functions.http('dialogflowWebhook', async (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    const twilioMessageBody = req.body.Body;
    const twilioFromNumber = req.body.From;

    async function handleIntent(agent) {
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, twilioFromNumber);

        const detectIntentRequest = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: twilioMessageBody,
                    languageCode: 'es',
                },
            },
        };

        try {
            const responses = await sessionClient.detectIntent(detectIntentRequest);
            const fulfillmentText = responses[0].queryResult.fulfillmentText;

            res.set('Content-Type', 'text/xml');
            res.send(`<Response><Message>${fulfillmentText}</Message></Response>`);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(`<Response><Message>Ocurrió un error procesando tu mensaje</Message></Response>`);
        }
    }

    await handleIntent(agent);
});
