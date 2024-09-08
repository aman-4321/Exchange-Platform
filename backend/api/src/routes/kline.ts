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

  if (
    !startTime ||
    !endTime ||
    typeof startTime !== "string" ||
    typeof endTime !== "string"
  ) {
    return res
      .status(400)
      .send("startTime and endTime are required and must be valid timestamps");
  }

  const start = new Date(parseInt(startTime) * 1000);
  const end = new Date(parseInt(endTime) * 1000);

  let query;
  switch (interval) {
    case "1m":
      query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
      break;
    case "1h":
      query = "SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2";
      break;
    case "1w":
      query = "SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2";
      break;
    default:
      return res.status(400).send("Invalid interval");
  }

  try {
    const result = await pgClient.query(query, [start, end]);
    res.json(
      result.rows.map((x) => ({
        close: x.close,
        end: x.bucket,
        high: x.high,
        low: x.low,
        open: x.open,
        quoteVolume: x.quoteVolume,
        start: x.start,
        trades: x.trades,
        volume: x.volume,
      })),
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
