const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  getAdminReport,
  getEmployeeReport,
} = require("../controllers/reportController");

router.use(authMiddleware);

router.get("/admin", getAdminReport);
router.get("/employee", getEmployeeReport);

module.exports = router;
