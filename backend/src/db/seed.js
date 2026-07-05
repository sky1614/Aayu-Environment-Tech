require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { db, client, initDb } = require('./index');
const { users, leads, trades, trips, alerts } = require('./schema');

async function seed() {
  await initDb();

  console.log('Clearing existing data...');
  await client.batch([
    'DELETE FROM alerts',
    'DELETE FROM trips',
    'DELETE FROM trades',
    'DELETE FROM leads',
    'DELETE FROM users',
  ], 'write');

  console.log('Seeding users...');
  await db.insert(users).values([
    { name: 'Aayush Sharma',  email: 'admin@aayuenviro.com',   passwordHash: bcrypt.hashSync('admin123',   10), role: 'admin'   },
    { name: 'Priya Mehta',    email: 'manager@aayuenviro.com', passwordHash: bcrypt.hashSync('manager123', 10), role: 'manager' },
  ]);

  console.log('Seeding leads...');
  await db.insert(leads).values([
    { name: 'Rajesh Kumar',      email: 'rajesh@agrocorp.in',       phone: '+91 98765 43210', company: 'AgroCorp India',     message: 'Interested in wheat procurement for Q1 2025',          projectType: 'Commodity Trading', status: 'qualified' },
    { name: 'Sarah Johnson',     email: 'sarah.j@grainexports.com', phone: '+1 555 234 5678',  company: 'Grain Exports LLC',  message: 'Looking for long-term soybean supply contract',        projectType: 'Export Logistics',  status: 'new'       },
    { name: 'Mohammed Al-Farsi', email: 'm.alfarsi@gulftrade.ae',   phone: '+971 50 123 4567', company: 'Gulf Trade Partners',message: 'Need logistics support for rice imports',               projectType: 'Import Logistics',  status: 'contacted' },
    { name: 'Ananya Patel',      email: 'ananya@foodchain.co.in',   phone: '+91 99001 12345',  company: 'FoodChain Co.',      message: 'Exploring onion export opportunities',                  projectType: 'Export Logistics',  status: 'new'       },
    { name: 'David Chen',        email: 'd.chen@asiagrain.hk',      phone: '+852 9876 5432',   company: 'Asia Grain HK',      message: 'Bulk maize procurement inquiry for feed mills',         projectType: 'Commodity Trading', status: 'qualified' },
  ]);

  console.log('Seeding trades...');
  await db.insert(trades).values([
    { commodity: 'Wheat',   buyer: 'AgroCorp India',     quantityMt: 5000, value: 1750000, status: 'completed', tradeDate: '2024-11-15', settlementDate: '2024-11-30' },
    { commodity: 'Soybean', buyer: 'Grain Exports LLC',  quantityMt: 2500, value: 1125000, status: 'active',    tradeDate: '2024-12-01', settlementDate: '2024-12-20' },
    { commodity: 'Maize',   buyer: 'Asia Grain HK',      quantityMt: 8000, value: 1920000, status: 'active',    tradeDate: '2024-12-05', settlementDate: '2025-01-10' },
    { commodity: 'Onion',   buyer: 'Gulf Trade Partners', quantityMt: 500,  value:  350000, status: 'pending',   tradeDate: '2024-12-10', settlementDate: null         },
    { commodity: 'Rice',    buyer: 'FoodChain Co.',       quantityMt: 3000, value: 2100000, status: 'pending',   tradeDate: '2024-12-12', settlementDate: null         },
  ]);

  console.log('Seeding trips...');
  await db.insert(trips).values([
    { tripRef: 'TRP-2024-001', origin: 'Kandla Port, Gujarat', destination: 'Dubai, UAE',        commodity: 'Wheat',   carrier: 'Maersk Line',      weightMt: 5000, status: 'on-time', eta: '2024-12-20' },
    { tripRef: 'TRP-2024-002', origin: 'Mumbai Port',           destination: 'Hong Kong',         commodity: 'Soybean', carrier: 'MSC Shipping',     weightMt: 2500, status: 'delayed', eta: '2024-12-18' },
    { tripRef: 'TRP-2024-003', origin: 'Chennai Port',          destination: 'Singapore',         commodity: 'Rice',    carrier: 'Evergreen Marine', weightMt: 3000, status: 'on-time', eta: '2024-12-25' },
    { tripRef: 'TRP-2024-004', origin: 'Nhava Sheva, Mumbai',   destination: 'Abu Dhabi, UAE',    commodity: 'Onion',   carrier: 'CMA CGM',          weightMt:  500, status: 'loading', eta: '2024-12-30' },
    { tripRef: 'TRP-2024-005', origin: 'Kolkata Port',          destination: 'Dhaka, Bangladesh', commodity: 'Maize',   carrier: 'PIL Line',         weightMt: 1500, status: 'on-time', eta: '2024-12-16' },
  ]);

  console.log('Seeding alerts...');
  await db.insert(alerts).values([
    { module: 'Logistics',  severity: 'critical', title: 'Shipment Delay - TRP-2024-002',    message: 'Soybean shipment to Hong Kong delayed by 3 days due to port congestion at Mumbai.',          resolved: false },
    { module: 'Trading',    severity: 'high',     title: 'Payment Due - AgroCorp India',     message: 'Settlement payment of ₹1.47 Cr due in 2 days for wheat trade #1.',                           resolved: false },
    { module: 'Leads',      severity: 'medium',   title: '5 Unresponded Leads',              message: 'Leads from FoodChain Co. and Asia Grain HK awaiting follow-up for over 48 hours.',            resolved: false },
    { module: 'Compliance', severity: 'high',     title: 'Export Documentation Pending',     message: 'Export license renewal required for Onion shipment TRP-2024-004 before departure.',            resolved: false },
  ]);

  console.log('\nDone! Seeded:');
  console.log('  2 users  — admin@aayuenviro.com / admin123');
  console.log('             manager@aayuenviro.com / manager123');
  console.log('  5 leads, 5 trades, 5 trips, 4 alerts\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
