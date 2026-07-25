const { Router } = require('express');
const { eq, and, or, like, sql } = require('drizzle-orm');
const { db } = require('../db');
const { alerts } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  const { severity, resolved, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  const conditions = [];
  if (severity) conditions.push(eq(alerts.severity, severity));
  if (resolved !== undefined) conditions.push(eq(alerts.resolved, resolved === 'true'));
  if (search) {
    conditions.push(or(like(alerts.title, `%${search}%`), like(alerts.message, `%${search}%`)));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    where
      ? db.select().from(alerts).where(where).limit(limit).offset(offset)
      : db.select().from(alerts).limit(limit).offset(offset),
    where
      ? db.select({ count: sql`count(*)` }).from(alerts).where(where)
      : db.select({ count: sql`count(*)` }).from(alerts),
  ]);

  res.json({
    success: true,
    data: rows,
    pagination: buildPaginationMeta(page, limit, Number(count)),
  });
});

router.patch('/:id/resolve', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = await db.update(alerts).set({ resolved: true }).where(eq(alerts.id, id)).returning();
  if (!result.length) return res.status(404).json({ success: false, error: 'Alert not found' });
  res.json(result[0]);
});

module.exports = router;
