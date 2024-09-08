import { Request, Response, Router } from "express";
import { Client } from "pg";

export const balancesRouter = Router();
const client = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});
client.connect();

balancesRouter.get("/", async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const query = `SELECT balance FROM balances WHERE user_id = $1`;
    const values = [userId];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ balance: result.rows[0].balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
