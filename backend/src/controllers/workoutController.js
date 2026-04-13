const db = require("../config/db");
const { recomputeDay, todayISO } = require("../services/fitquestService");

async function completeWorkout(req, res) {
  const date = req.body.date || todayISO();
  await db.query(
    `INSERT INTO workouts (user_id, date, completed)
     VALUES ($1, $2, true)
     ON CONFLICT (user_id, date) DO UPDATE SET completed = true`,
    [req.userId, date]
  );
  await recomputeDay(req.userId, date);
  return res.status(201).json({ message: "Treino marcado como concluido.", date });
}

async function workoutHistory(req, res) {
  const result = await db.query(
    "SELECT id, date, completed, created_at FROM workouts WHERE user_id = $1 ORDER BY date DESC LIMIT 30",
    [req.userId]
  );
  return res.json(result.rows);
}

module.exports = { completeWorkout, workoutHistory };
