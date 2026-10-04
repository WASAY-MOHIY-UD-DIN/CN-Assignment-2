const express = require('express');
const pool = require('./db');
const router = express.Router();

// READ ALL
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM opportunities ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
