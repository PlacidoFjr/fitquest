const { z } = require("zod");
const db = require("../config/db");
const { recomputeDay, todayISO } = require("../services/fitquestService");

const mealSchema = z.object({
  name: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  category: z.string().default("Lanche"),
  date: z.string().optional(),
});

async function createMeal(req, res) {
  try {
    const body = mealSchema.parse(req.body);
    const date = body.date || todayISO();
    const result = await db.query(
      "INSERT INTO meals (user_id, date, name, calories, protein, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.userId, date, body.name, body.calories, body.protein, body.category]
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

async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM meals WHERE id = $1 AND user_id = $2 RETURNING date",
      [id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Refeição não encontrada." });
    }
    await recomputeDay(req.userId, result.rows[0].date);
    return res.status(200).json({ message: "Refeição removida." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { createMeal, listMeals, deleteMeal };
