import { Request, Response, Router } from "express";
import { Client } from "pg";
import { authMiddleware } from "../middleware";

export const tradesRouter = Router();

const client = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});
client.connect();

tradesRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  const { market, limit = 10 } = req.query;

  try {
    const query = `
      SELECT * FROM trades
      WHERE market = $1
      ORDER BY timestamp DESC
      LIMIT $2;
    `;
    const values = [market, limit];
    const result = await client.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
