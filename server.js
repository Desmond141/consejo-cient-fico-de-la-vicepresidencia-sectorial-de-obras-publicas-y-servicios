const express = require('express');
const apiApp = require('./api/index.js');
const port = process.env.PORT || 3000;

const app = express();
app.use('/api', apiApp);

app.listen(port, () => {
  console.log(`Servidor de desarrollo escuchando en http://localhost:${port}`);
});
