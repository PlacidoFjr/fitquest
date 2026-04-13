export type GoalType = "emagrecer" | "manter" | "ganhar_massa";

export interface UserProfile {
  id: number;
  email: string;
  weight: number;
  height: number;
  goal_type: GoalType;
  calorie_goal: number;
  protein_goal: number;
  total_xp: number;
  level: number;
  current_streak: number;
}

export interface DailyProgress {
  id: number;
  date: string;
  calories_total: number;
  protein_total: number;
  mission_protein_completed: boolean;
  mission_calories_completed: boolean;
  mission_workout_completed: boolean;
  completed_missions_count: number;
  daily_xp: number;
  feedback_grade: "S" | "A" | "B" | "C";
}
