const express = require("express");
const router = express.Router();

const { login,registerEmployee } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", registerEmployee);

module.exports = router;