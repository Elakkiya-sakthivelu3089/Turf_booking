const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Game Routes");
});

module.exports = router;
