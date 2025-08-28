# Backend - CSV S3 API

This is a Node.js + Express backend for fetching and parsing a CSV file from an AWS S3 bucket, and returning the data as JSON. Written in **TypeScript**.

---

## Features

- Fetch CSV from a specified AWS S3 bucket.
- Parse CSV on the server using `csv-parser`.
- Return parsed data as JSON to the frontend.
- Robust error handling:
  - Missing CSV file
  - CSV parsing errors
  - S3 access errors
  - Missing environment variables

---

### API Endpoint

- GET `/api/data` – Returns the parsed CSV as JSON.

## Environment Variables

Create a `.env` file in the root dir:

```env
PORT=3000
AWS_CLIENT_ID=your_aws_access_key
AWS_CLIENT_SECRET=your_aws_secret_key
AWS_REGION=your_region
S3_BUCKET=your_bucket
S3_FILE=your_file
```

## Installation

1. Navigate to `backend`

```
npm install
npm start
```

# Frontend

## Installation

1. Navigate to `frontend`
2. Run `npm install`
3. Start app: `npm run dev`
4. Navigate to: http://localhost:5173/
