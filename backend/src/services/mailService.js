const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendWelcomeEmail(to, name) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #020617; color: #f8fafc; padding: 40px; border-radius: 24px; border: 1px solid #1e293b;">
      <h1 style="color: #22c55e; font-size: 32px; font-weight: 900; margin-bottom: 24px;">FitQuest</h1>
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Bem-vindo à Arena, ${name}!</h2>
      <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 32px;">
        Sua jornada épica para transformar sua disciplina em conquistas começou. Estamos empolgados em ter você conosco!
      </p>
      <div style="background: #0f172a; padding: 24px; border-radius: 16px; border: 1px solid #1e293b;">
        <p style="margin: 0; color: #f8fafc; font-weight: 600;">O que vem agora?</p>
        <ul style="color: #94a3b8; margin-top: 12px; padding-left: 20px;">
          <li>Defina seu objetivo no Dashboard</li>
          <li>Registre seu primeiro treino</li>
          <li>Acompanhe suas macros diárias</li>
        </ul>
      </div>
      <p style="margin-top: 40px; font-size: 12px; color: #475569; text-align: center;">
        FitQuest &copy; 2026 - Transformando Disciplina em Progresso
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Bem-vindo ao FitQuest! 🚀",
    html,
  });
}

async function sendRecoveryEmail(to, name, token) {
  const recoveryUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #020617; color: #f8fafc; padding: 40px; border-radius: 24px; border: 1px solid #1e293b;">
      <h1 style="color: #22c55e; font-size: 32px; font-weight: 900; margin-bottom: 24px;">FitQuest</h1>
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Recuperação de Senha</h2>
      <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 32px;">
        Olá, ${name}. Recebemos uma solicitação para redefinir sua senha. Se não foi você, ignore este e-mail.
      </p>
      <a href="${recoveryUrl}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">
        Redefinir Minha Senha
      </a>
      <p style="color: #475569; font-size: 12px; margin-top: 32px;">
        Este link expira em 1 hora.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Recuperação de Senha - FitQuest 🔐",
    html,
  });
}

module.exports = { sendWelcomeEmail, sendRecoveryEmail };
