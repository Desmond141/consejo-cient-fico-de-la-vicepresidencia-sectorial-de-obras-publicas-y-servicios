const handler = require('./index');

module.exports = (req, res) => {
  // Dejar la URL tal cual para que Express pueda leer path y params
  return handler(req, res);
};
