const { Router } = require("express");
const { login, register, forgotPassword, resetPassword, googleLogin } = require("../controllers/authController");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
