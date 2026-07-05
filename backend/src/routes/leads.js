const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { leads } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { validate, leadSchema } = require('../middleware/validate');

const router = Router();

const leadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions, please try again in a minute' },
});

router.post('/', leadRateLimit, validate(leadSchema), async (req, res) => {
  try {
    const result = await db.insert(leads).values({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone ?? null,
      company: req.body.company ?? null,
      message: req.body.message ?? null,
      projectType: req.body.projectType ?? null,
    }).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const result = status
      ? await db.select().from(leads).where(eq(leads.status, status))
      : await db.select().from(leads);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const result = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    if (!result.length) return res.status(404).json({ error: 'Lead not found' });
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
