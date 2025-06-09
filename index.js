'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 10000; // Render proporcionará el puerto

// ---- INICIO: CAMBIO CLAVE PARA MANEJO SEGURO DE CREDENCIALES ----

// 1. Obtener el contenido JSON de las credenciales desde la variable de entorno
//    Asegúrate de haber configurado GOOGLE_APPLICATION_CREDENTIALS_JSON en Render
//    con TODO el contenido de tu archivo .json (como un string JSON).
let credentials;
try {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('La variable de entorno GOOGLE_APPLICATION_CREDENTIALS_JSON no está configurada.');
  }
  credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} catch (error) {
  console.error('Error al cargar credenciales desde variables de entorno:', error);
  // Es crítico que las credenciales existan para que la app funcione.
  // Podrías decidir salir de la aplicación o manejarlo de otra forma.
  process.exit(1); // Sale si las credenciales no se pueden cargar
}

// 2. Configurar el cliente de Dialogflow con las credenciales cargadas
const { SessionsClient } = require('@google-cloud/dialogflow');

const sessionClient = new SessionsClient({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, '\n'), // Importante para manejar los saltos de línea
  },
  projectId: credentials.project_id, // Usar el project_id de las credenciales
});

// El ID del proyecto de Dialogflow ahora se toma directamente de las credenciales
const projectId = credentials.project_id; 

// ---- FIN: CAMBIO CLAVE ----

const bodyParser = require('body-parser');
const twilio = require('twilio');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Endpoint para el webhook de Twilio
app.post('/', async (req, res) => {
  const message = req.body.Body; // Mensaje de Twilio
  const from = req.body.From;   // Número de remitente de Twilio
  
  // Usar el project ID y el número de remitente para crear la ruta de la sesión
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, from);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'es', // Idioma de tu agente de Dialogflow
      },
    },
  };

  try {
    // Detectar la intención usando Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    console.log("RESPUESTA DE DIALOGFLOW:", JSON.stringify(result, null, 2));
  
    // Obtener la respuesta de cumplimiento de Dialogflow o un mensaje por defecto
    const reply = result.fulfillmentText || 'Lo siento, no entendí eso. ¿Podrías repetirlo?';

    // Construir la respuesta TwiML para Twilio
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(reply);

    // Enviar la respuesta XML a Twilio
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error al procesar el mensaje con Dialogflow:', error);

    // Enviar un mensaje de error al usuario de Twilio
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message('Lo siento, ocurrió un error interno al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde. 😔');

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Renace AI escuchando en el puerto ${port}`);
  console.log(`Webhook URL esperada: https://renaceai-bot.onrender.com/`);
});

