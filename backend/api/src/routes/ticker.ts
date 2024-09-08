import { Request, Response, Router } from "express";
import { Client } from "pg";

export const tickersRouter = Router();

const client = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});
client.connect();

tickersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT * FROM ticker
      ORDER BY last_updated DESC;
    `;
    const result = await client.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
