const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.issues });
  }
  req.body = result.data;
  next();
};

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  projectType: z.string().optional(),
});

const tradeSchema = z.object({
  commodity: z.string().min(1),
  buyer: z.string().min(1),
  quantityMt: z.number().positive(),
  value: z.number().positive(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).optional(),
  tradeDate: z.string().min(1),
  settlementDate: z.string().optional(),
});

const tripSchema = z.object({
  tripRef: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  commodity: z.string().min(1),
  carrier: z.string().min(1),
  weightMt: z.number().positive(),
  status: z.enum(['scheduled', 'loading', 'in-transit', 'on-time', 'delayed', 'delivered']).optional(),
  eta: z.string().optional(),
});

module.exports = { validate, leadSchema, tradeSchema, tripSchema };
