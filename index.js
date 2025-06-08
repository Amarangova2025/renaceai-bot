const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dialogflowUrl = "https://dialogflow.googleapis.com/v2/projects/renaceai-bot-ysvq/agent/sessions/123456789:detectIntent"; // Reemplaza con tu URL real si tienes una.

const dialogflowToken = "Bearer TU_TOKEN_DE_DIALOGFLOW"; // O usar una cuenta de servicio si quieres más seguridad.

app.post("/dialogflowWebhook", async (req, res) => {
  try {
    const incomingMsg = req.body.Body || req.body.message;
    const sessionId = req.body.From || "anonimo";

    const dfResponse = await axios.post(
      dialogflowUrl,
      {
        queryInput: {
          text: {
            text: incomingMsg,
            languageCode: "es",
          },
        },
      },
      {
        headers: {
          Authorization: dialogflowToken,
        },
      }
    );

    const respuestaDialogflow = dfResponse.data.queryResult.fulfillmentText;

    res.send(respuestaDialogflow);
  } catch (err) {
    console.error("Error con Dialogflow:", err.message);
    res.status(500).send("Lo sentimos, ocurrió un error.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

