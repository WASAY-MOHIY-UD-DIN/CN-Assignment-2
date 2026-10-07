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

const TEXT_FIELD_LIMITS = {
  title: 255,
  research_area: 100,
  faculty_name: 100,
  department: 100,
  required_skills: 500,
};

function validate(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Request body must be a JSON object'];
  }

  for (const f of TEXT_FIELDS) {
    if (typeof data[f] !== 'string' || data[f].trim() === '') {
      errors.push(`${f} is required`);
    } else if (TEXT_FIELD_LIMITS[f] && data[f].trim().length > TEXT_FIELD_LIMITS[f]) {
      errors.push(`${f} must be at most ${TEXT_FIELD_LIMITS[f]} characters`);
    }
  }

  const pos = Number(data.positions);
  if (data.positions === undefined || data.positions === null || data.positions === '' ||
      !Number.isInteger(pos) || pos < 1 || pos > 2147483647) {
    errors.push('positions must be a whole number of at least 1');
  }

  const deadline = typeof data.deadline === 'string' ? data.deadline : '';
  const deadlineParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
  const validDeadline = deadlineParts && (() => {
    const [, year, month, day] = deadlineParts.map(Number);
    if (year < 1000) return false;
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
  })();
  if (!validDeadline) {
    errors.push('deadline is required in YYYY-MM-DD format');
  }

  if (!['Open', 'Closed'].includes(data.status)) {
    errors.push("status must be 'Open' or 'Closed'");
  }

  return errors;
}

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: 'Invalid ID' });
    return null;
  }
  return id;
}

// 1. CREATE
router.post('/', async (req, res, next) => {
  try {
    const data = { status: 'Open', ...req.body };
    const errors = validate(data);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const [result] = await pool.query(
      `INSERT INTO opportunities
       (title, description, research_area, faculty_name, department,
        required_skills, positions, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title.trim(),
        data.description.trim(),
        data.research_area.trim(),
        data.faculty_name.trim(),
        data.department.trim(),
        data.required_skills.trim(),
        Number(data.positions),
        data.deadline,
        data.status,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 2. READ ALL
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM opportunities ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// 3. READ ONE
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 4. UPDATE (partial fields bhi chalengi, e.g. sirf status)
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const merged = { ...rows[0], ...req.body };
    const errors = validate(merged);
    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    await pool.query(
      `UPDATE opportunities SET
        title = ?, description = ?, research_area = ?, faculty_name = ?,
        department = ?, required_skills = ?, positions = ?, deadline = ?, status = ?
       WHERE id = ?`,
      [
        merged.title.trim(),
        merged.description.trim(),
        merged.research_area.trim(),
        merged.faculty_name.trim(),
        merged.department.trim(),
        merged.required_skills.trim(),
        Number(merged.positions),
        merged.deadline,
        merged.status,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    res.status(200).json(updated[0]);
  } catch (err) {
    next(err);
  }
});

// 5. DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const [result] = await pool.query('DELETE FROM opportunities WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
