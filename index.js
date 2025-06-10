const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/', (req, res) => {
  const { Body, From } = req.body;
  console.log(`Mensaje recibido: ${Body} de ${From}`);
  res.send('Mensaje recibido');
});

app.listen(port, () => {
  console.log(`Renace AI escuchando en el puerto ${port}`);
});
