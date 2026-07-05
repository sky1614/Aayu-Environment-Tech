const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const path = require('path');
const fs = require('fs');
const schema = require('./schema');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const client = createClient({ url: `file:${path.join(dataDir, 'aayu.db')}` });
const db = drizzle(client, { schema });

async function initDb() {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      message TEXT,
      project_type TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commodity TEXT NOT NULL,
      buyer TEXT NOT NULL,
      quantity_mt REAL NOT NULL,
      value REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      trade_date TEXT NOT NULL,
      settlement_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_ref TEXT NOT NULL UNIQUE,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      commodity TEXT NOT NULL,
      carrier TEXT NOT NULL,
      weight_mt REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      eta TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ], 'write');
}

module.exports = { db, client, initDb };
