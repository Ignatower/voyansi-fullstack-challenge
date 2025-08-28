import express, { Request, Response } from "express";
import cors from "cors";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import dotenv from "dotenv";
import stream from "stream";

interface CSVRow {
  ID: string;
  Name: string;
  Email: string;
  Age: string;
  City: string;
}

dotenv.config();

if (
  !process.env.AWS_CLIENT_ID ||
  !process.env.AWS_CLIENT_SECRET ||
  !process.env.S3_BUCKET ||
  !process.env.S3_FILE ||
  !process.env.AWS_REGION
) {
  throw new Error("Missing AWS or S3 configuration in environment variables");
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_CLIENT_ID!,
    secretAccessKey: process.env.AWS_CLIENT_SECRET!,
  },
});

// Helper to parse CSV stream
const parseCsvStream = (readable: stream.Readable): Promise<CSVRow[]> => {
  const results: CSVRow[] = [];
  return new Promise((resolve, reject) => {
    readable
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// GET /api/data
app.get("/api/data", async (req: Request, res: Response) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: process.env.S3_FILE!,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      return res.status(404).json({ error: "CSV file not found or empty" });
    }

    const readable = response.Body as stream.Readable;

    try {
      const data: CSVRow[] = await parseCsvStream(readable);
      res.json({ data });
    } catch (csvErr: any) {
      console.error("CSV parse error:", csvErr);
      res.status(500).json({ error: "CSV parse error: " + csvErr.message });
    }
  } catch (err: any) {
    console.error("S3 fetch error:", err);

    if (err.name === "NoSuchKey") {
      res.status(404).json({ error: "CSV file not found in S3" });
    } else if (err.$metadata?.httpStatusCode === 403) {
      res.status(403).json({ error: "Access denied to S3 bucket" });
    } else {
      res.status(500).json({ error: "Failed to fetch CSV: " + err.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
