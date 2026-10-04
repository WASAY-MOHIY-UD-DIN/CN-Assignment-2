const express = require('express');
const pool = require('./db');
const router = express.Router();

const TEXT_FIELDS = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
];

function validate(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Request body must be a JSON object'];
  }
  for (const f of TEXT_FIELDS) {
    if (!data[f] || typeof data[f] !== 'string' || data[f].trim() === '') {
      errors.push(`${f} is required`);
    }
  }
  if (!data.positions || Number(data.positions) < 1) {
    errors.push('positions must be a whole number of at least 1');
  }
  if (!data.deadline) {
    errors.push('deadline is required in YYYY-MM-DD format');
  }
  if (!['Open', 'Closed'].includes(data.status)) {
    errors.push("status must be 'Open' or 'Closed'");
  }
  return errors;
}

// 2. READ ALL
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM opportunities ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
