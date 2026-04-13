const db = require("../config/db");
const {
  calculateDailyXp,
  calculateFeedback,
  calculateLevel,
  getMissionStatus,
} = require("../utils/gamification");

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function getProfile(userId) {
  const result = await db.query(
    "SELECT id, email, name, weight, height, goal_type, calorie_goal, protein_goal, total_xp, level, current_streak, age, gender, activity_level FROM users WHERE id = $1",
    [userId]
  );
  return result.rows[0];
}

async function upsertDailyProgress(userId, date) {
  await db.query(
    `INSERT INTO daily_progress (user_id, date)
     VALUES ($1, $2)
     ON CONFLICT (user_id, date) DO NOTHING`,
    [userId, date]
  );
}

async function recomputeDay(userId, date = todayISO()) {
  const profile = await getProfile(userId);
  if (!profile) {
    throw new Error("Usuario nao encontrado.");
  }

  await upsertDailyProgress(userId, date);

  const meals = await db.query(
    "SELECT COALESCE(SUM(calories), 0) AS calories_total, COALESCE(SUM(protein), 0) AS protein_total FROM meals WHERE user_id = $1 AND date = $2",
    [userId, date]
  );
  const workouts = await db.query(
    "SELECT id FROM workouts WHERE user_id = $1 AND date = $2 LIMIT 1",
    [userId, date]
  );

  const caloriesTotal = Number(meals.rows[0].calories_total || 0);
  const proteinTotal = Number(meals.rows[0].protein_total || 0);
  const workoutDone = workouts.rowCount > 0;

  const status = getMissionStatus({
    proteinTotal,
    caloriesTotal,
    workoutDone,
    proteinGoal: Number(profile.protein_goal),
    calorieGoal: Number(profile.calorie_goal),
  });

  const dailyXp = calculateDailyXp(status);
  const feedback = calculateFeedback(status.completedCount);

  await db.query(
    `UPDATE daily_progress
     SET calories_total = $1,
         protein_total = $2,
         mission_protein_completed = $3,
         mission_calories_completed = $4,
         mission_workout_completed = $5,
         completed_missions_count = $6,
         daily_xp = $7,
         feedback_grade = $8
     WHERE user_id = $9 AND date = $10`,
    [
      caloriesTotal,
      proteinTotal,
      status.proteinMission,
      status.caloriesMission,
      status.workoutMission,
      status.completedCount,
      dailyXp,
      feedback,
      userId,
      date,
    ]
  );

  await db.query(
    `INSERT INTO xp_logs (user_id, date, source, xp)
     VALUES ($1, $2, 'workout', $3), ($1, $2, 'calories', $4), ($1, $2, 'protein', $5)
     ON CONFLICT (user_id, date, source) DO UPDATE SET xp = EXCLUDED.xp`,
    [userId, date, status.workoutMission ? 50 : 0, status.caloriesMission ? 70 : 0, status.proteinMission ? 30 : 0]
  );

  const xpRes = await db.query("SELECT COALESCE(SUM(daily_xp), 0) AS total_xp FROM daily_progress WHERE user_id = $1", [userId]);
  const totalXp = Number(xpRes.rows[0].total_xp || 0);
  const level = calculateLevel(totalXp);
  await db.query("UPDATE users SET total_xp = $1, level = $2 WHERE id = $3", [totalXp, level, userId]);

  await recalculateStreak(userId);
}

async function recalculateStreak(userId) {
  const rows = await db.query(
    "SELECT date, completed_missions_count FROM daily_progress WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  );
  let streak = 0;
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const row of rows.rows) {
    const rowDate = new Date(row.date);
    rowDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((current - rowDate) / (1000 * 60 * 60 * 24));
    if (diffDays !== streak || Number(row.completed_missions_count) < 2) {
      break;
    }
    streak += 1;
  }

  await db.query("UPDATE users SET current_streak = $1 WHERE id = $2", [streak, userId]);
}

module.exports = {
  todayISO,
  getProfile,
  recomputeDay,
};
