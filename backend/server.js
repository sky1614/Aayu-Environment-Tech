require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { client, initDb } = require('./src/db');
const healthRouter = require('./src/routes/health');
const authRouter   = require('./src/routes/auth');
const leadsRouter  = require('./src/routes/leads');
const tradesRouter = require('./src/routes/trades');
const tripsRouter  = require('./src/routes/trips');
const alertsRouter = require('./src/routes/alerts');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/health',  healthRouter);
app.use('/api/auth',    authRouter);
app.use('/api/leads',   leadsRouter);
app.use('/api/trades',  tradesRouter);
app.use('/api/trips',   tripsRouter);
app.use('/api/alerts',  alertsRouter);

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log('\nRoutes:');
      console.log('  GET    /api/health');
      console.log('  POST   /api/auth/login');
      console.log('  GET    /api/auth/me              (auth)');
      console.log('  POST   /api/leads                (public, 5/min)');
      console.log('  GET    /api/leads                (auth)');
      console.log('  PATCH  /api/leads/:id            (auth)');
      console.log('  GET    /api/trades               (auth)');
      console.log('  POST   /api/trades               (auth)');
      console.log('  PATCH  /api/trades/:id           (auth)');
      console.log('  GET    /api/trips                (auth)');
      console.log('  POST   /api/trips                (auth)');
      console.log('  PATCH  /api/trips/:id            (auth)');
      console.log('  GET    /api/alerts               (auth)');
      console.log('  PATCH  /api/alerts/:id/resolve   (auth)');
      console.log('\n  DB: SQLite connected (libsql)\n');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
