import { Request, Response, Router } from "express";
import { Client } from "pg";
import { authMiddleware } from "../middleware";

export const onRampRouter = Router();
const client = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});
client.connect();

onRampRouter.post("/", authMiddleware, async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: "User ID and amount are required" });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  try {
    const userQuery = `SELECT balance FROM balances WHERE user_id = $1`;
    const userValues = [userId];
    const userResult = await client.query(userQuery, userValues);

    if (userResult.rows.length === 0) {
      await client.query(
        `INSERT INTO balances (user_id, balance) VALUES ($1, $2)`,
        [userId, amount],
      );
    } else {
      await client.query(
        `UPDATE balances SET balance = balance + $1 WHERE user_id = $2`,
        [amount, userId],
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing on-ramp:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
