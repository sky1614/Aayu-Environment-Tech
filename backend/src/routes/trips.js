const { Router } = require('express');
const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { trips } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { validate, tripSchema } = require('../middleware/validate');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const result = status
      ? await db.select().from(trips).where(eq(trips.status, status))
      : await db.select().from(trips);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, validate(tripSchema), async (req, res) => {
  try {
    const result = await db.insert(trips).values({
      tripRef: req.body.tripRef,
      origin: req.body.origin,
      destination: req.body.destination,
      commodity: req.body.commodity,
      carrier: req.body.carrier,
      weightMt: req.body.weightMt,
      status: req.body.status ?? 'scheduled',
      eta: req.body.eta ?? null,
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
    const { status, eta } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (eta !== undefined) updates.eta = eta;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No updates provided' });

    const result = await db.update(trips).set(updates).where(eq(trips.id, id)).returning();
    if (!result.length) return res.status(404).json({ error: 'Trip not found' });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
