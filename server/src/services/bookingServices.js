const prisma = require("../config/prisma");

// Booking status constants
const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

/**
 * Check if user has an active booking
 * Active = PENDING or CONFIRMED status
 */
const checkActiveBooking = async (userId) => {
  const activeBooking = await prisma.booking.findFirst({
    where: {
      userId,
      status: {
        in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      },
    },
  });

  return activeBooking;
};

/**
 * Check if a time slot is available for booking
 * Slot is unavailable if there's a CONFIRMED booking at that time for the same game
 */
const checkSlotAvailability = async (gameId, startTime, endTime) => {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      gameId,
      status: BOOKING_STATUS.CONFIRMED,
      AND: [
        { startTime: { lt: new Date(endTime) } },
        { endTime: { gt: new Date(startTime) } },
      ],
    },
  });

  return !conflictingBooking; // true if available
};

/**
 * Create a new booking
 * Rules:
 * - User can only have one active booking
 * - Cannot book overlapping time slots for same game
 */
const createBooking = async (userId, gameId, startTime, endTime) => {
  // Check for active bookings
  const activeBooking = await checkActiveBooking(userId);
  if (activeBooking) {
    throw new Error(
      "You already have an active booking. Cancel it first to book another slot."
    );
  }

  // Check slot availability
  const isAvailable = await checkSlotAvailability(gameId, startTime, endTime);
  if (!isAvailable) {
    throw new Error(
      "This time slot is not available. Please choose a different time."
    );
  }

  // Get game details
  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      gameId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: BOOKING_STATUS.PENDING,
      totalAmount: game.pricePerHour * ((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)),
    },
    include: {
      game: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return booking;
};

/**
 * Get user's bookings with role-based filtering
 */
const getUserBookings = async (userId, userRole) => {
  const query = {
    where: userRole === "EMPLOYEE" ? { userId } : {},
    include: {
      game: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  };

  return prisma.booking.findMany(query);
};

/**
 * Cancel a booking
 */
const cancelBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Only allow user or admin to cancel
  if (booking.userId !== userId && userRole !== "ADMIN") {
    throw new Error("You don't have permission to cancel this booking");
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new Error("Booking is already cancelled");
  }

  if (booking.status === BOOKING_STATUS.COMPLETED) {
    throw new Error("Cannot cancel a completed booking");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BOOKING_STATUS.CANCELLED },
    include: {
      game: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return updatedBooking;
};

/**
 * Get available slots for a game on a specific date
 */
const getAvailableSlots = async (gameId, date, slotDuration = 1) => {
  // Define business hours (9 AM - 9 PM)
  const startHour = 9;
  const endHour = 21;
  const slots = [];

  for (let hour = startHour; hour < endHour; hour += slotDuration) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + slotDuration, 0, 0, 0);

    // Check if slot is available
    const isBooked = await prisma.booking.findFirst({
      where: {
        gameId,
        status: BOOKING_STATUS.CONFIRMED,
        AND: [
          { startTime: { lt: slotEnd } },
          { endTime: { gt: slotStart } },
        ],
      },
    });

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      available: !isBooked,
    });
  }

  return slots;
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  checkActiveBooking,
  checkSlotAvailability,
  getAvailableSlots,
  BOOKING_STATUS,
};
