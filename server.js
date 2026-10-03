require('dotenv').config();
const express = require('express');
const path = require('path');
const opportunitiesRouter = require('./opportunities');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.use('/api/opportunities', opportunitiesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
