const { z } = require("zod");
const db = require("../config/db");
const { getProfile } = require("../services/fitquestService");

const profileSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  goalType: z.enum(["emagrecer", "manter", "ganhar_massa"]),
  calorieGoal: z.number().positive(),
  proteinGoal: z.number().positive(),
});

async function getMe(req, res) {
  const profile = await getProfile(req.userId);
  return res.json(profile);
}

async function updateProfile(req, res) {
  try {
    const body = profileSchema.parse(req.body);
    const updated = await db.query(
      `UPDATE users
       SET weight = $1, height = $2, goal_type = $3, calorie_goal = $4, protein_goal = $5
       WHERE id = $6
       RETURNING id, email, weight, height, goal_type, calorie_goal, protein_goal, total_xp, level, current_streak`,
      [body.weight, body.height, body.goalType, body.calorieGoal, body.proteinGoal, req.userId]
    );
    return res.json(updated.rows[0]);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = { getMe, updateProfile };
