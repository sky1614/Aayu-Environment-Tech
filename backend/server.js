require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const healthRouter = require('./src/routes/health');
const leadsRouter = require('./src/routes/leads');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/health', healthRouter);
app.use('/api/leads', leadsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
