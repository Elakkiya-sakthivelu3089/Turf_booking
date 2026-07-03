const express = require("express");
const router = express.Router();

const {
  getBookingPage,
  joinBooking,
  listAllBookings,
  listMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getBookingPage);
router.get("/all", authMiddleware, listAllBookings);
router.get("/mine", authMiddleware, listMyBookings);
router.post("/join", authMiddleware, joinBooking);
router.delete("/cancel/:id", authMiddleware, cancelBooking);

module.exports = router;
