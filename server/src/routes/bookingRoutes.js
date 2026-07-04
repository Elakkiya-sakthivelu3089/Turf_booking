const express = require("express");
const router = express.Router();

const {
  getBookingPage,
  getPublicBookingPage,
  generatePublicBookingLink,
  registerPublicEmployee,
  joinPublicBooking,
  joinBooking,
  listAllBookings,
  listMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/auth");

router.post("/links", authMiddleware, generatePublicBookingLink);
router.get("/public/:token", getPublicBookingPage);
router.post("/public/register", registerPublicEmployee);
router.post("/public/join", joinPublicBooking);

router.get("/", authMiddleware, getBookingPage);
router.get("/all", authMiddleware, listAllBookings);
router.get("/mine", authMiddleware, listMyBookings);
router.post("/join", authMiddleware, joinBooking);
router.delete("/cancel/:id", authMiddleware, cancelBooking);

module.exports = router;
