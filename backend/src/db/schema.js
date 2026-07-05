const { sqliteTable, text, integer, real } = require('drizzle-orm/sqlite-core');
const { sql } = require('drizzle-orm');

const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('viewer'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  message: text('message'),
  projectType: text('project_type'),
  status: text('status').notNull().default('new'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

const trades = sqliteTable('trades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commodity: text('commodity').notNull(),
  buyer: text('buyer').notNull(),
  quantityMt: real('quantity_mt').notNull(),
  value: real('value').notNull(),
  status: text('status').notNull().default('pending'),
  tradeDate: text('trade_date').notNull(),
  settlementDate: text('settlement_date'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripRef: text('trip_ref').notNull().unique(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  commodity: text('commodity').notNull(),
  carrier: text('carrier').notNull(),
  weightMt: real('weight_mt').notNull(),
  status: text('status').notNull().default('scheduled'),
  eta: text('eta'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

const alerts = sqliteTable('alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  module: text('module').notNull(),
  severity: text('severity').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

module.exports = { users, leads, trades, trips, alerts };
