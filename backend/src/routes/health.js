const { Router } = require('express');
const { client } = require('../db');

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await client.execute('SELECT 1');
    res.json({ status: 'ok', ts: Date.now(), db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', ts: Date.now(), db: 'disconnected' });
  }
});

module.exports = router;
