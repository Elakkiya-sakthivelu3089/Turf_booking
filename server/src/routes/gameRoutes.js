const express = require("express");
const router = express.Router();

const {
  createGame,
  getGames,
  updateGame,
  deleteGame,
} = require("../controllers/gameController");

router.post("/", createGame);
router.get("/", getGames);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);

module.exports = router;