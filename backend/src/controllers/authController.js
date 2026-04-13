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

const { sendWelcomeEmail, sendRecoveryEmail } = require("../services/mailService");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Verifica se o usuário já existe
    let user = await db.query("SELECT id, email FROM users WHERE email = $1", [email]);

    if (user.rowCount === 0) {
      // Cria novo usuário via Google
      // Nota: Como é login social, geramos um hash aleatório para a senha já que não será usada
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      const newUser = await db.query(
        `INSERT INTO users (email, password_hash, weight, height, goal_type, calorie_goal, protein_goal)
         VALUES ($1, $2, 70, 170, 'manter', 2200, 120)
         RETURNING id, email`,
        [email, passwordHash]
      );
      user = newUser;
      
      // Email de boas vindas para novo usuário social
      sendWelcomeEmail(email, name || email.split("@")[0]).catch(err => console.error(err));
    }

    const token = buildToken(user.rows[0].id);
    return res.json({ token, user: user.rows[0] });
  } catch (error) {
    console.error("Erro Google Login:", error);
    return res.status(400).json({ message: "Falha na autenticação com Google." });
  }
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
    
    // Enviar email de boas-vindas de forma assíncrona (não trava a resposta)
    const userName = body.email.split("@")[0];
    sendWelcomeEmail(body.email, userName).catch(err => console.error("Erro email boas-vindas:", err));

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

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await db.query("SELECT id, email FROM users WHERE email = $1", [email]);
    
    if (user.rowCount === 0) {
      // Por segurança, não informamos que o e-mail não existe
      return res.json({ message: "Se este e-mail estiver cadastrado, um link de recuperação será enviado." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await db.query(
      "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3",
      [resetToken, expires, user.rows[0].id]
    );

    const userName = email.split("@")[0];
    await sendRecoveryEmail(email, userName, resetToken);

    return res.json({ message: "Se este e-mail estiver cadastrado, um link de recuperação será enviado." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    const user = await db.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()",
      [token]
    );

    if (user.rowCount === 0) {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2",
      [passwordHash, user.rows[0].id]
    );

    return res.json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
