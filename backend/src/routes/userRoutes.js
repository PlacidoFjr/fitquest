const { Router } = require("express");
const { getMe, updateProfile } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
