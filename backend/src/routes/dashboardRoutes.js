const { Router } = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getDashboard, history } = require("../controllers/dashboardController");

const router = Router();

router.get("/", authMiddleware, getDashboard);
router.get("/history", authMiddleware, history);

module.exports = router;
