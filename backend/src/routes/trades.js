const { Router } = require('express');
const { eq, and, or, like, sql } = require('drizzle-orm');
const { db } = require('../db');
const { trades } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { validate, tradeSchema } = require('../middleware/validate');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  const { status, commodity, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  const conditions = [];
  if (status) conditions.push(eq(trades.status, status));
  if (commodity) conditions.push(eq(trades.commodity, commodity));
  if (search) {
    conditions.push(or(like(trades.commodity, `%${search}%`), like(trades.buyer, `%${search}%`)));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    where
      ? db.select().from(trades).where(where).limit(limit).offset(offset)
      : db.select().from(trades).limit(limit).offset(offset),
    where
      ? db.select({ count: sql`count(*)` }).from(trades).where(where)
      : db.select({ count: sql`count(*)` }).from(trades),
  ]);

  res.json({
    success: true,
    data: rows,
    pagination: buildPaginationMeta(page, limit, Number(count)),
  });
});

router.post('/', verifyToken, validate(tradeSchema), async (req, res) => {
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
});

router.patch('/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, settlementDate } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (settlementDate !== undefined) updates.settlementDate = settlementDate;
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'No updates provided' });

  const result = await db.update(trades).set(updates).where(eq(trades.id, id)).returning();
  if (!result.length) return res.status(404).json({ success: false, error: 'Trade not found' });
  res.json(result[0]);
});

module.exports = router;
