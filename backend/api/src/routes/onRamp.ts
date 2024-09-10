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
  const { amount } = req.body;
  const userId = req.user?.id;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (!userId) {
    return res.status(401).json({ error: "User ID is required" });
  }

  try {
    const balanceQuery = `SELECT balance FROM balances WHERE user_id = $1`;
    const balanceValues = [userId];
    const balanceResult = await client.query(balanceQuery, balanceValues);

    if (balanceResult.rows.length === 0) {
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

    return res.json({
      success: true,
      message: `Successfully added ${amount} to your account`,
    });
  } catch (error) {
    console.error("Error processing on-ramp:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});
