function getMissionStatus({ proteinTotal, caloriesTotal, workoutDone, proteinGoal, calorieGoal }) {
  const proteinMission = proteinTotal >= proteinGoal;
  const caloriesMission = caloriesTotal <= calorieGoal;
  const workoutMission = Boolean(workoutDone);

  return {
    proteinMission,
    caloriesMission,
    workoutMission,
    completedCount: [proteinMission, caloriesMission, workoutMission].filter(Boolean).length,
  };
}

function calculateDailyXp(status) {
  let xp = (status.workoutMission ? 50 : 0) + (status.caloriesMission ? 70 : 0) + (status.proteinMission ? 30 : 0);
  
  // Bônus Lendário: Bateu as 3 missões principais
  if (status.completedCount === 3) {
    xp += 50;
  }
  
  return xp;
}

function calculateFeedback(completedCount) {
  if (completedCount === 3) return "S";
  if (completedCount === 2) return "A";
  if (completedCount === 1) return "B";
  return "C";
}

function calculateLevel(totalXp) {
  return Math.floor(totalXp / 100) + 1;
}

module.exports = {
  getMissionStatus,
  calculateDailyXp,
  calculateFeedback,
  calculateLevel,
};
