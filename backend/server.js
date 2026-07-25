const config = require('./src/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { client, initDb } = require('./src/db');
const sanitize = require('./src/middleware/sanitize');
const errorHandler = require('./src/middleware/errorHandler');
const healthRouter = require('./src/routes/health');
const authRouter   = require('./src/routes/auth');
const leadsRouter  = require('./src/routes/leads');
const tradesRouter = require('./src/routes/trades');
const tripsRouter  = require('./src/routes/trips');
const alertsRouter = require('./src/routes/alerts');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://aayu-environment-tech.vercel.app',
  config.CORS_ORIGIN,
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(sanitize);

app.use(morgan('dev', { skip: (req) => req.originalUrl === '/api/health' }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/health',  healthRouter);
app.use('/api/auth/login', loginRateLimit);
app.use('/api/auth',    authRouter);
app.use('/api/leads',   leadsRouter);
app.use('/api/trades',  tradesRouter);
app.use('/api/trips',   tripsRouter);
app.use('/api/alerts',  alertsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

initDb()
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`\nServer running on http://localhost:${config.PORT}`);
      console.log('\nRoutes:');
      console.log('  GET    /api/health');
      console.log('  POST   /api/auth/login           (5/15min)');
      console.log('  GET    /api/auth/me              (auth)');
      console.log('  POST   /api/leads                (public, 5/min)');
      console.log('  GET    /api/leads                (auth, paginated)');
      console.log('  PATCH  /api/leads/:id            (auth)');
      console.log('  GET    /api/trades               (auth, paginated)');
      console.log('  POST   /api/trades               (auth)');
      console.log('  PATCH  /api/trades/:id           (auth)');
      console.log('  GET    /api/trips                (auth, paginated)');
      console.log('  POST   /api/trips                (auth)');
      console.log('  PATCH  /api/trips/:id            (auth)');
      console.log('  GET    /api/alerts               (auth, paginated)');
      console.log('  PATCH  /api/alerts/:id/resolve   (auth)');
      console.log('\n  DB: SQLite connected (libsql)\n');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
