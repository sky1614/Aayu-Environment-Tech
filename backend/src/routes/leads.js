const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { eq, and, or, like, sql } = require('drizzle-orm');
const { db } = require('../db');
const { leads } = require('../db/schema');
const { verifyToken } = require('../middleware/auth');
const { validate, leadSchema } = require('../middleware/validate');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { sendLeadNotification, sendLeadConfirmation } = require('../services/email');

const router = Router();

const leadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions, please try again in a minute' },
});

router.post('/', leadRateLimit, validate(leadSchema), async (req, res) => {
  const result = await db.insert(leads).values({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone ?? null,
    company: req.body.company ?? null,
    message: req.body.message ?? null,
    projectType: req.body.projectType ?? null,
  }).returning();

  const lead = result[0];
  res.status(201).json(lead);

  const [notifyResult, confirmResult] = await Promise.allSettled([
    sendLeadNotification(lead),
    sendLeadConfirmation(lead),
  ]);

  console.log(
    `[email] lead #${lead.id} notification: ${notifyResult.status}` +
    (notifyResult.status === 'rejected' ? ` (${notifyResult.reason.message})` : '')
  );
  console.log(
    `[email] lead #${lead.id} confirmation: ${confirmResult.status}` +
    (confirmResult.status === 'rejected' ? ` (${confirmResult.reason.message})` : '')
  );
});

router.get('/', verifyToken, async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query);

  const conditions = [];
  if (status) conditions.push(eq(leads.status, status));
  if (search) {
    conditions.push(or(like(leads.name, `%${search}%`), like(leads.email, `%${search}%`)));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    where
      ? db.select().from(leads).where(where).limit(limit).offset(offset)
      : db.select().from(leads).limit(limit).offset(offset),
    where
      ? db.select({ count: sql`count(*)` }).from(leads).where(where)
      : db.select({ count: sql`count(*)` }).from(leads),
  ]);

  res.json({
    success: true,
    data: rows,
    pagination: buildPaginationMeta(page, limit, Number(count)),
  });
});

router.patch('/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });

  const result = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
  if (!result.length) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json(result[0]);
});

module.exports = router;
