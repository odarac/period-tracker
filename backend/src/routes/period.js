import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_TOKEN = process.env.JWT_TOKEN;

// Middleware to check token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_TOKEN);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

function getPhase(numDays) {
  if (numDays < 12) return "Follicular Phase";
  if (numDays < 17) return "Ovulation Phase";
  return "Luteal Phase";
}

// start period
router.post("/start", authenticate, async (req, res) => {
  const { startDate } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO periods (user_id, start_date) VALUES ($1, $2) RETURNING *",
      [req.user.id, startDate]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// end period
router.post("/end", authenticate, async (req, res) => {
  const { endDate } = req.body;
  try {
    const query = await pool.query(
      "SELECT * FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1",
      [req.user.id]
    );
    const lastPeriod = query.rows[0];
    if (!lastPeriod) {
      return res.status(404).json({ message: "No periods found" });
    } 
    if (lastPeriod.end_date) {
      return res.status(400).json({ message: "Latest period already ended" });
    }

    const result = await pool.query(
      "UPDATE periods SET end_date = $1 where id = $2 RETURNING *",
      [endDate, lastPeriod.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get last period + predict next period and current phase 
// or get number of days since period started
router.get("/last", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1",
      [req.user.id]
    );

    const last = result.rows[0];
    if (!last) {
      return res.status(404).json({ message: "No periods found" });
    }

    const startDate = new Date(last.start_date);
    const today = new Date();
    const numDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const phase = getPhase(numDays);

    if (last.end_date) {
      const query = await pool.query(
        "SELECT min_cycle_length, max_cycle_length FROM users WHERE id = $1",
        [req.user.id]
      );
      const { min_cycle_length, max_cycle_length } = query.rows[0];

      const minPrediction = new Date(last.start_date);
      minPrediction.setDate(minPrediction.getDate() + min_cycle_length);
      const minDays = Math.floor((minPrediction - today) / (1000 * 60 * 60 * 24));

      if (max_cycle_length) {
        const maxPrediction = new Date(last.start_date);      
        maxPrediction.setDate(maxPrediction.getDate() + max_cycle_length);      
        const maxDays = Math.floor((maxPrediction - today) / (1000 * 60 * 60 * 24));

        res.json({ 
          lastPeriod: last, 
          minPredictedNextStart: minPrediction.toISOString().split("T")[0], 
          maxPredictedNextStart: maxPrediction.toISOString().split("T")[0],
          minDaysToPeriod: minDays,
          maxDaysToPeriod: maxDays,
          phase,
        });
      }     

      res.json({ 
        lastPeriod: last, 
        minPredictedNextStart: minPrediction.toISOString().split("T")[0], 
        minDaysToPeriod: minDays,
        phase,
      });
    } else {
      res.json({ 
        lastPeriod: last, 
        numDaysSinceStart: numDays, 
        phase: "Menstrual Phase",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get a history of past periods
router.get("/history", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 12",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No periods found" });
    }

    const formattedResult = result.rows.map(period => ({
      ...period,
      start_date: period.start_date ? period.start_date.toISOString().split("T")[0] : null,
      end_date: period.end_date ? period.end_date.toISOString().split("T")[0] : null
    }));

    res.json(formattedResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
