const db = require("../config/db");
const { getProfile, recomputeDay, todayISO } = require("../services/fitquestService");

async function getDashboard(req, res) {
  const date = req.query.date || todayISO();
  await recomputeDay(req.userId, date);

  const profile = await getProfile(req.userId);
  const progress = await db.query("SELECT * FROM daily_progress WHERE user_id = $1 AND date = $2", [req.userId, date]);
  const meals = await db.query(
    "SELECT id, name, calories, protein, date, created_at FROM meals WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC",
    [req.userId, date]
  );
  const workouts = await db.query("SELECT id, date, completed FROM workouts WHERE user_id = $1 ORDER BY date DESC LIMIT 14", [req.userId]);

  return res.json({
    date,
    profile,
    dailyProgress: progress.rows[0] || null,
    meals: meals.rows,
    workoutHistory: workouts.rows,
  });
}

async function history(req, res) {
  const result = await db.query(
    "SELECT date, calories_total, protein_total, completed_missions_count, daily_xp, feedback_grade FROM daily_progress WHERE user_id = $1 ORDER BY date DESC LIMIT 30",
    [req.userId]
  );
  return res.json(result.rows);
}

module.exports = { getDashboard, history };
