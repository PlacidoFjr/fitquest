const { Router } = require("express");
const { createMeal, listMeals } = require("../controllers/mealController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = Router();

router.get("/", authMiddleware, listMeals);
router.post("/", authMiddleware, createMeal);

module.exports = router;
