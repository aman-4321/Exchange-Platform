import { Request, Response, Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Client } from "pg";
import { signinSchema, signupSchema } from "../types/types";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const userRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "sec3ret";
const SALT_ROUNDS = 10;

const pgClient = new Client({
  user: "user",
  host: "localhost",
  database: "database",
  password: "password",
  port: 5432,
});
pgClient.connect();

userRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const parsedData = signupSchema.parse(req.body);
    const { username, email, password } = parsedData;

    const userExists = await pgClient.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userExists.rows.length > 0) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pgClient.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword],
    );

    const userId = result.rows[0].id;
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "1h" });

    res
      .status(201)
      .json({ token, userId, message: "User registered successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send("Server error");
  }
});

userRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const parsedData = signinSchema.parse(req.body);
    const { email, password } = parsedData;

    const user = await pgClient.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).send("User not found");
    }

    const userData = user.rows[0];

    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) {
      return res.status(400).send("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: userData.id, email: userData.email },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token, userId: userData.id, message: "Logged in successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.errors);
    }
    res.status(500).send("Server error");
  }
});
