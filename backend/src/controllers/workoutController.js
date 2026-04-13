const { z } = require("zod");
const db = require("../config/db");
const { recomputeDay, todayISO } = require("../services/fitquestService");

const workoutSchema = z.object({
  date: z.string().optional(),
  type: z.string().default("musculação"),
  duration_minutes: z.number().int().positive().default(60),
  calories_burned: z.number().nonnegative().default(0),
});

async function completeWorkout(req, res) {
  try {
    const body = workoutSchema.parse(req.body);
    const date = body.date || todayISO();
    
    const result = await db.query(
      `INSERT INTO workouts (user_id, date, type, duration_minutes, calories_burned, completed)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [req.userId, date, body.type, body.duration_minutes, body.calories_burned]
    );
    
    await recomputeDay(req.userId, date);
    return res.status(201).json({ message: "Treino registrado com sucesso.", workout: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function workoutHistory(req, res) {
  const result = await db.query(
    "SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC, created_at DESC LIMIT 30",
    [req.userId]
  );
  return res.json(result.rows);
}

async function undoWorkout(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING date",
      [id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Treino não encontrado." });
    }
    await recomputeDay(req.userId, result.rows[0].date);
    return res.status(200).json({ message: "Treino removido." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { completeWorkout, workoutHistory, undoWorkout };
