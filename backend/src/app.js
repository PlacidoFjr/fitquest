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

if (!authRoutes || !userRoutes || !mealRoutes || !workoutRoutes || !dashboardRoutes) {
  console.error("Erro fatal: Algumas rotas não foram carregadas corretamente!");
}

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
