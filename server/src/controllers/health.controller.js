export const getHealth = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'arogya-ai-express-api',
    runtime: 'JavaScript (ES Modules)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
};
