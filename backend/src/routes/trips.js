const { Router } = require('express');
const { eq, and, or, like, sql } = require('drizzle-orm');
const { db } = require('../db');
const { trips } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { validate, tripSchema } = require('../middleware/validate');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  const { status, carrier, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  const conditions = [];
  if (status) conditions.push(eq(trips.status, status));
  if (carrier) conditions.push(like(trips.carrier, `%${carrier}%`));
  if (search) {
    conditions.push(or(
      like(trips.origin, `%${search}%`),
      like(trips.destination, `%${search}%`),
      like(trips.commodity, `%${search}%`),
      like(trips.carrier, `%${search}%`),
      like(trips.tripRef, `%${search}%`)
    ));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    where
      ? db.select().from(trips).where(where).limit(limit).offset(offset)
      : db.select().from(trips).limit(limit).offset(offset),
    where
      ? db.select({ count: sql`count(*)` }).from(trips).where(where)
      : db.select({ count: sql`count(*)` }).from(trips),
  ]);

  res.json({
    success: true,
    data: rows,
    pagination: buildPaginationMeta(page, limit, Number(count)),
  });
});

router.post('/', verifyToken, validate(tripSchema), async (req, res) => {
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
});

router.patch('/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, eta } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (eta !== undefined) updates.eta = eta;
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'No updates provided' });

  const result = await db.update(trips).set(updates).where(eq(trips.id, id)).returning();
  if (!result.length) return res.status(404).json({ success: false, error: 'Trip not found' });
  res.json(result[0]);
});

module.exports = router;
