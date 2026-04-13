const { Router } = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { completeWorkout, workoutHistory, undoWorkout } = require("../controllers/workoutController");

const router = Router();

router.post("/complete", authMiddleware, completeWorkout);
router.get("/history", authMiddleware, workoutHistory);
router.delete("/:id", authMiddleware, undoWorkout);

module.exports = router;
