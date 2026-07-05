const { Router } = require('express');
const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { alerts } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.select().from(alerts).where(eq(alerts.resolved, false));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await db.update(alerts).set({ resolved: true }).where(eq(alerts.id, id)).returning();
    if (!result.length) return res.status(404).json({ error: 'Alert not found' });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
