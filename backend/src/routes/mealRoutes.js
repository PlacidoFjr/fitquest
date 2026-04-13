const { Router } = require("express");
const { createMeal, listMeals, deleteMeal } = require("../controllers/mealController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = Router();

router.get("/", authMiddleware, listMeals);
router.post("/", authMiddleware, createMeal);
router.delete("/:id", authMiddleware, deleteMeal);

module.exports = router;
