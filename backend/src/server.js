require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 5000;

// Initialize Database connection and sync models
const startServer = async () => {
  try {
    console.log(`Connecting to database (${db.sequelize.options.dialect})...`);
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models (force: false preserves data, alters table structures where safe)
    // Note: Use migrations in production environments
    await db.sequelize.sync({ force: false });
    console.log('Database models synchronized successfully.');

    const server = app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`  Doctor Hub Server is running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`  Listening on port: http://localhost:${PORT}`);
      console.log(`=============================================`);
    });

    // Handle abrupt shutdown signals gracefully
    const shutdown = () => {
      console.log('\nShutting down server gracefully...');
      server.close(async () => {
        console.log('HTTP server closed.');
        await db.sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Unable to start the server due to database connection error:', error);
    process.exit(1);
  }
};

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

startServer();
