import { Request, Response, Router } from "express";
import { Client } from "pg";

const pgClient = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});

pgClient.connect();

export const klineRouter = Router();

klineRouter.get("/", async (req: Request, res: Response) => {
  const { market, interval, startTime, endTime } = req.query;

  if (!market || !startTime || !endTime) {
    return res.status(400).json({
      error: "Market, startTime, and endTime are required",
    });
  }

  if (typeof startTime !== "string" || typeof endTime !== "string") {
    return res
      .status(400)
      .json({ error: "startTime and endTime must be strings" });
  }

  const start = new Date(parseInt(startTime) * 1000);
  const end = new Date(parseInt(endTime) * 1000);

  let query;
  switch (interval) {
    case "1m":
      query = `SELECT * FROM klines_1m WHERE market = $1 AND bucket >= $2 AND bucket <= $3`;
      break;
    case "1h":
      query = `SELECT * FROM klines_1h WHERE market = $1 AND bucket >= $2 AND bucket <= $3`;
      break;
    case "1w":
      query = `SELECT * FROM klines_1w WHERE market = $1 AND bucket >= $2 AND bucket <= $3`;
      break;
    default:
      return res.status(400).json({ error: "Invalid interval" });
  }

  try {
    const result = await pgClient.query(query, [market, start, end]);
    res.json(
      result.rows.map((row) => ({
        start: row.start,
        end: row.bucket,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: row.volume,
        quoteVolume: row.quoteVolume,
        trades: row.trades,
      })),
    );
  } catch (err) {
    console.error("Error fetching kline data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
