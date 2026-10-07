# University Research Opportunity Portal

A small web application for managing university research opportunities. The Node.js and Express server serves the frontend and exposes a REST API backed by MySQL.

## Assignment deliverables

- Backend source: `server.js`, `db.js`, and `opportunities.js`
- Frontend source: `index.html`, `app.js`, and `style.css`
- MySQL setup: `schema.sql`
- API requests: `research-opportunity-portal.postman_collection.json`
- Assignment brief: `BCS-5A(Assignment01).pdf`

## Requirements

- Node.js 18 or newer
- MySQL Server

## Setup and run

1. Create the database and table:

   ```sh
   mysql -u root -p < schema.sql
   ```

2. Copy `.env.example` to `.env` in this directory and set your local MySQL credentials. Do not commit `.env` or put passwords in the repository.

3. Install dependencies and start the server:

   ```sh
   npm install
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The `.env.example` defaults to a local MySQL server, database `research_portal`, and port `3000`. Change `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, or `PORT` in your private `.env` file if needed.

## Frontend features

- List opportunities fetched from the API
- View full opportunity details
- Create and edit opportunities
- Change an Open opportunity to Closed
- Delete opportunities
- Required-field validation and success/error messages

## REST API

All data is stored in MySQL; the frontend does not use hard-coded opportunity records.

| Method | Endpoint | Result |
| --- | --- | --- |
| `POST` | `/api/opportunities` | Create an opportunity (`201`) |
| `GET` | `/api/opportunities` | List opportunities (`200`) |
| `GET` | `/api/opportunities/:id` | Return one opportunity (`200`, or `404`) |
| `PUT` | `/api/opportunities/:id` | Update an opportunity (`200`, `400`, or `404`) |
| `DELETE` | `/api/opportunities/:id` | Delete an opportunity (`200`, or `404`) |

Invalid request data returns `400`; unexpected server errors return `500`.

Each opportunity has a unique ID, title, description, research area, faculty name, department, required skills, number of positions, application deadline, and `Open` or `Closed` status.

## API collection

Import `research-opportunity-portal.postman_collection.json` into Postman. Set `baseUrl` to `http://localhost:3000` if needed. The collection includes three create requests, list and detail requests, an update, a close request, a delete followed by a lookup of the deleted record, and an invalid-data request. Run the create requests first; the remaining sample requests use IDs `1` and `3` and may need those IDs changed to match the records in your local database.

## Submission items to complete

- Replace the repository link below with the accessible GitHub repository URL after creating and pushing the repository.
- Add the approximately one-minute demonstration video link after recording and uploading the required demo.
- Include the code, schema, collection, README, repository link, and video or video link in the ZIP named `P24 0000 NAME CLASS.zip`, replacing the example identity with your assigned details.

**GitHub repository:** `ADD_REPOSITORY_URL`

**Demonstration video:** `ADD_DEMO_VIDEO_URL`
