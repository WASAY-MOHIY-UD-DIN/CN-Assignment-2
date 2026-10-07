# University Research Opportunity Portal

A small web application for managing university research opportunities. The Node.js and Express server serves the frontend and exposes a REST API backed by MySQL.

## Requirements

- Node.js 18 or newer
- MySQL Server

## Setup and run

1. Create database:
   ```sh
   mysql -u root -p < schema.sql
   ```
2. Copy `.env.example` to `.env`.
3. Install dependencies and start:
   ```sh
   npm install
   npm start
   ```
