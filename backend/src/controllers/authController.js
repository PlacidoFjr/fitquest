const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../config/db");

const authSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

function buildToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function register(req, res) {
  try {
    const body = authSchema.parse(req.body);
    const exists = await db.query("SELECT id FROM users WHERE email = $1", [body.email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ message: "Email ja cadastrado." });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await db.query(
      `INSERT INTO users (email, password_hash, weight, height, goal_type, calorie_goal, protein_goal)
       VALUES ($1, $2, 70, 170, 'manter', 2200, 120)
       RETURNING id, email`,
      [body.email, passwordHash]
    );
    const token = buildToken(user.rows[0].id);
    return res.status(201).json({ token, user: user.rows[0] });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const body = authSchema.parse(req.body);
    const user = await db.query("SELECT id, email, password_hash FROM users WHERE email = $1", [body.email]);
    if (user.rowCount === 0) {
      return res.status(401).json({ message: "Credenciais invalidas." });
    }

    const match = await bcrypt.compare(body.password, user.rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ message: "Credenciais invalidas." });
    }

    const token = buildToken(user.rows[0].id);
    return res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email } });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = { register, login };
