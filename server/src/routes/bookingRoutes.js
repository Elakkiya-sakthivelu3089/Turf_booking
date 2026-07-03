const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Booking Routes");
});

module.exports = router;
