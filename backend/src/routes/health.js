const { Router } = require('express');
const router = Router();

router.get('/', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

module.exports = router;
