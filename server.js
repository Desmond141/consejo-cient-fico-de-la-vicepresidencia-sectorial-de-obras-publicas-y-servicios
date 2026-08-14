const express = require('express');
const path = require('path');
const apiApp = require('./api/index.js');
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname)));
app.use('/api', apiApp);

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/login', (req, res) => {
  res.redirect('/login.html');
});

app.get('/superadmin-home', (req, res) => {
  res.redirect('/superadmin-home.html');
});

app.listen(port, () => {
  console.log(`Servidor de desarrollo escuchando en http://localhost:${port}`);
});
