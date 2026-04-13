require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const mealRoutes = require("./routes/mealRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const db = require("./config/db");

// Função para rodar migrações/scripts SQL automaticamente no banco de dados
const runMigrations = async () => {
  try {
    console.log("Iniciando migrações de banco de dados...");
    
    // 1. Garante que a tabela workouts tenha as colunas novas (type, duration_minutes, calories_burned)
    // Usamos um bloco anônimo para evitar erros se as colunas já existirem
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='type') THEN
          ALTER TABLE workouts ADD COLUMN type VARCHAR(50) DEFAULT 'musculação';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='duration_minutes') THEN
          ALTER TABLE workouts ADD COLUMN duration_minutes INTEGER DEFAULT 60;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='calories_burned') THEN
          ALTER TABLE workouts ADD COLUMN calories_burned NUMERIC(10,2) DEFAULT 0;
        END IF;

        -- Remove a restrição UNIQUE antiga que impedia mais de um treino por dia
        ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_user_id_date_key;
      END $$;
    `);

    // 2. Garante que as colunas de calorias e proteínas sejam NUMERIC para evitar erro de integer
    await db.query(`
      ALTER TABLE meals ALTER COLUMN calories TYPE NUMERIC(10,2);
      ALTER TABLE meals ALTER COLUMN protein TYPE NUMERIC(10,2);
      ALTER TABLE daily_progress ALTER COLUMN calories_total TYPE NUMERIC(10,2);
      ALTER TABLE daily_progress ALTER COLUMN protein_total TYPE NUMERIC(10,2);
    `);

    console.log("Migrações concluídas com sucesso!");
  } catch (err) {
    console.error("Erro ao rodar migrações:", err);
  }
};

// Executa migrações na inicialização
runMigrations();

// Log de diagnóstico para identificar qual rota está falhando
console.log("Diagnóstico de Rotas:");
console.log("- authRoutes:", typeof authRoutes);
console.log("- userRoutes:", typeof userRoutes);
console.log("- mealRoutes:", typeof mealRoutes);
console.log("- workoutRoutes:", typeof workoutRoutes);
console.log("- dashboardRoutes:", typeof dashboardRoutes);

const app = express();

// Configuração de CORS para aceitar qualquer origem do Vercel e localhost
app.use(cors({
  origin: true, // Permite todas as origens (ideal para fase de testes/Vercel)
  credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Middleware para lidar com o prefixo /_/backend do Vercel Services
app.use((req, res, next) => {
  if (req.url.startsWith("/_/backend")) {
    req.url = req.url.replace("/_/backend", "");
  }
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
