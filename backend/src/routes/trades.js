const { Router } = require('express');
const { eq, and } = require('drizzle-orm');
const { db } = require('../db');
const { trades } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { validate, tradeSchema } = require('../middleware/validate');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, commodity } = req.query;
    const conditions = [];
    if (status) conditions.push(eq(trades.status, status));
    if (commodity) conditions.push(eq(trades.commodity, commodity));

    const result = conditions.length
      ? await db.select().from(trades).where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : await db.select().from(trades);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, validate(tradeSchema), async (req, res) => {
  try {
    const result = await db.insert(trades).values({
      commodity: req.body.commodity,
      buyer: req.body.buyer,
      quantityMt: req.body.quantityMt,
      value: req.body.value,
      status: req.body.status ?? 'pending',
      tradeDate: req.body.tradeDate,
      settlementDate: req.body.settlementDate ?? null,
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, settlementDate } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (settlementDate !== undefined) updates.settlementDate = settlementDate;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No updates provided' });

    const result = await db.update(trades).set(updates).where(eq(trades.id, id)).returning();
    if (!result.length) return res.status(404).json({ error: 'Trade not found' });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
