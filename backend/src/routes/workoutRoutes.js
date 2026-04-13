const { Router } = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { completeWorkout, workoutHistory } = require("../controllers/workoutController");

const router = Router();

router.post("/complete", authMiddleware, completeWorkout);
router.get("/history", authMiddleware, workoutHistory);

module.exports = router;
