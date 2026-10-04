require('dotenv').config();
const express = require('express');
const path = require('path');
const opportunitiesRouter = require('./opportunities');

const app = express();
app.use(express.json());

// Serve the frontend files kept alongside this server.
app.use(express.static(__dirname));

app.use('/api/opportunities', opportunitiesRouter);

// Unknown API route
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (400 for bad JSON, 500 for everything else)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
