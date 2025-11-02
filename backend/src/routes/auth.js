import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_TOKEN = process.env.JWT_TOKEN;

// sign up
router.post("/signup", async (req, res) => {
  const { 
    username, 
    password, 
    max_cycle_length, 
    min_cycle_length, 
    last_period_start, 
    last_period_end } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // validate username
    const usernameValidation = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (usernameValidation.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({error: "Username already exists"});
    }

    // insert
    const hash = await bcrypt.hash(password, 10);
    const insertUserResult = await client.query(
      "INSERT INTO users (username, password, min_cycle_length, max_cycle_length) VALUES ($1, $2, $3, $4) RETURNING id", 
      [username, hash, min_cycle_length, max_cycle_length || null]
    );
    const userID = insertUserResult.rows[0].id;

    if (last_period_start) {
      await client.query(
        "INSERT INTO periods (user_id, start_date, end_date) VALUES ($1, $2, $3)",
        [userID, last_period_start, last_period_end || null]
      );
    }

    await client.query("COMMIT");
    res.json({message: "User created"});
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({error: err.message});
  } finally {
    client.release();
  }
});

// log in
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({error: "Invalid password"});
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_TOKEN, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

export default router;