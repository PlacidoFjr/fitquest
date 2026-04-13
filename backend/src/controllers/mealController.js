const { z } = require("zod");
const db = require("../config/db");
const { recomputeDay, todayISO } = require("../services/fitquestService");

const mealSchema = z.object({
  name: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  date: z.string().optional(),
});

async function createMeal(req, res) {
  try {
    const body = mealSchema.parse(req.body);
    const date = body.date || todayISO();
    const result = await db.query(
      "INSERT INTO meals (user_id, date, name, calories, protein) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.userId, date, body.name, body.calories, body.protein]
    );
    await recomputeDay(req.userId, date);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function listMeals(req, res) {
  const date = req.query.date || todayISO();
  const result = await db.query("SELECT * FROM meals WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC", [
    req.userId,
    date,
  ]);
  return res.json(result.rows);
}

module.exports = { createMeal, listMeals };
