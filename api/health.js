module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    endpoint: '/api/health',
    message: 'Vercel API function deployed successfully.'
  });
};
