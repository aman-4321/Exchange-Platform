import { Request, Response, Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Client } from "pg";

declare global {
  namespace Express {
    interface Request {
      user?: string;
      Headers?: string;
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

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

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

    await pgClient.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword],
    );

    res.status(201).send("User registered successfully");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).send(error.errors);
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

    res.send({ token, message: "Logged in successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).send(error.errors);
    }
    res.status(500).send("Server error");
  }
});
