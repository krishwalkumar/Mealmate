const { checkDbConnection } = require('../config/db');

async function getHealth(req, res, next) {
  try {
    const dbStatus = await checkDbConnection();
    const isHealthy = dbStatus.connected;

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'mealmate-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Number(process.uptime().toFixed(2)),
      database: {
        status: isHealthy ? 'connected' : 'disconnected',
        details: dbStatus.message
      }
    };

    // Return 200 even if DB is disconnected so clients get structured diagnostic info
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: healthData
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth
};
