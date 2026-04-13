CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash TEXT NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  height NUMERIC(5,2) NOT NULL,
  goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('emagrecer', 'manter', 'ganhar_massa')),
  calorie_goal INTEGER NOT NULL,
  protein_goal INTEGER NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  reset_token TEXT,
  reset_expires TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name VARCHAR(120) NOT NULL,
  calories NUMERIC(10,2) NOT NULL CHECK (calories >= 0),
  protein NUMERIC(10,2) NOT NULL CHECK (protein >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) DEFAULT 'musculação',
  duration_minutes INTEGER DEFAULT 60,
  calories_burned NUMERIC(10,2) DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  protein_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  mission_protein_completed BOOLEAN NOT NULL DEFAULT false,
  mission_calories_completed BOOLEAN NOT NULL DEFAULT false,
  mission_workout_completed BOOLEAN NOT NULL DEFAULT false,
  completed_missions_count INTEGER NOT NULL DEFAULT 0,
  daily_xp INTEGER NOT NULL DEFAULT 0,
  feedback_grade CHAR(1) NOT NULL DEFAULT 'C' CHECK (feedback_grade IN ('S', 'A', 'B', 'C')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS xp_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('workout', 'calories', 'protein')),
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, source)
);
