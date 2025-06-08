'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
  const mensaje = req.body.Body;
  console.log('Mensaje recibido:', mensaje);

  let respuesta = "Hola, soy Renace AI 🌸 ¿cómo te sientes hoy?";

  // Respuestas condicionales
  if (mensaje.toLowerCase().includes('solo')) {
    respuesta = "No estás sola 💛 Estoy contigo.";
  } else if (mensaje.toLowerCase().includes('vida')) {
    respuesta = "Tu vida es valiosa 🌟. Podemos hablar cuando quieras.";
  }

  res.set('Content-Type', 'text/xml');
  res.send(`<Response><Message>${respuesta}</Message></Response>`);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
