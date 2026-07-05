/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: `file:${require('path').resolve(__dirname, 'data/aayu.db')}`,
  },
};
