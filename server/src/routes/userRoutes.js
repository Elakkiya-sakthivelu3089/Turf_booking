const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.use(authMiddleware);

router.get("/", listUsers);
router.post("/", createUser);
router.get("/me", getUser);
router.put("/me", updateUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
