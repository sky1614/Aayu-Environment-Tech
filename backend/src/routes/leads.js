const { Router } = require('express');
const router = Router();

router.post('/', (_req, res) => res.json({ success: true }));

module.exports = router;
