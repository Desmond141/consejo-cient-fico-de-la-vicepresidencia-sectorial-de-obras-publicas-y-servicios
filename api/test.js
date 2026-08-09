module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    api: true,
    message: 'API test function is working.',
    path: req.url
  });
};
