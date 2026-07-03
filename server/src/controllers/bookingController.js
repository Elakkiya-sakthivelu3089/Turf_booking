const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { generateSlots, isBookableSlot } = require("../utils/slotUtils");

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getBookingPage = async (req, res) => {
  try {
    const selectedDate = normalizeDate(req.query.date || new Date());
    const slots = generateSlots();

    const games = await prisma.game.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        bookings: {
          where: {
            date: selectedDate,
          },
          include: {
            players: {
              where: {
                status: "BOOKED",
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedGames = games.map((game) => {
      const slotData = slots.map((slot) => {
        const booking = game.bookings.find(
          (b) =>
            b.startTime === slot.startTime &&
            b.endTime === slot.endTime
        );

        const players = booking?.players || [];

        return {
          ...slot,
          bookingId: booking?.id || null,
          teamA: players.filter((p) => p.team === "TEAM_A"),
          teamB: players.filter((p) => p.team === "TEAM_B"),
        };
      });

      return {
        id: game.id,
        name: game.name,
        categoryId: game.categoryId,
        category: game.category?.name?.toUpperCase(),
        teamALimit: game.teamALimit,
        teamBLimit: game.teamBLimit,
        slots: slotData,
      };
    });

    res.json({
      date: selectedDate,
      games: formattedGames,
    });
  } catch (error) {
    console.log("BOOKING PAGE ERROR:", error);
    res.status(500).json({
      message: "Failed to load bookings",
      error: error.message,
    });
  }
};

const joinBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }

    const { gameId, date, startTime, endTime, team } = req.body;

    if (!gameId || !date || !startTime || !endTime || !team) {
      return res.status(400).json({
        message: "gameId, date, startTime, endTime and team are required",
      });
    }

    if (!["TEAM_A", "TEAM_B"].includes(team)) {
      return res.status(400).json({
        message: "Team must be TEAM_A or TEAM_B",
      });
    }

    if (!isBookableSlot(startTime, endTime)) {
      return res.status(400).json({
        message: "This slot is blocked for break or maintenance",
      });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      const alreadyBooked = await tx.bookingPlayer.findFirst({
        where: {
          userId: Number(userId),
          date: selectedDate,
          startTime,
          endTime,
          status: "BOOKED",
        },
        include: {
          booking: {
            include: {
              game: true,
            },
          },
        },
      });

      if (alreadyBooked) {
        throw new Error(
          `You already booked ${alreadyBooked.booking.game.name} in this slot`
        );
      }

      const game = await tx.game.findUnique({
        where: { id: Number(gameId) },
      });

      if (!game || !game.isActive) {
        throw new Error("Game is not available for booking");
      }

      let booking = await tx.booking.findUnique({
        where: {
          gameId_date_startTime_endTime: {
            gameId: Number(gameId),
            date: selectedDate,
            startTime,
            endTime,
          },
        },
      });

      if (booking) {
        const teamCount = await tx.bookingPlayer.count({
          where: {
            bookingId: booking.id,
            team,
            status: "BOOKED",
          },
        });

        const teamLimit = team === "TEAM_A" ? game.teamALimit : game.teamBLimit;
        if (teamCount >= teamLimit) {
          throw new Error(`${team === "TEAM_A" ? "Team A" : "Team B"} is full for this slot`);
        }
      }

      if (!booking) {
        booking = await tx.booking.create({
          data: {
            gameId: Number(gameId),
            date: selectedDate,
            startTime,
            endTime,
          },
        });
      }

      const player = await tx.bookingPlayer.create({
        data: {
          bookingId: booking.id,
          userId: Number(userId),
          team,
          status: "BOOKED",
          date: selectedDate,
          startTime,
          endTime,
        },
      });

      return player;
    });

    res.status(201).json({
      message: "Slot booked successfully",
      data: result,
    });
  } catch (error) {
    console.log("JOIN BOOKING ERROR:", error);

    res.status(400).json({
      message: error.message || "Booking failed",
    });
  }
};

const listAllBookings = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const date = req.query.date ? normalizeDate(req.query.date) : undefined;

    const bookings = await prisma.bookingPlayer.findMany({
      where: {
        status: "BOOKED",
        ...(date ? { date } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        booking: {
          include: {
            game: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load booking report",
      error: error.message,
    });
  }
};

const listMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }

    const bookings = await prisma.bookingPlayer.findMany({
      where: {
        userId: Number(userId),
        status: "BOOKED",
      },
      include: {
        booking: {
          include: {
            game: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load your bookings",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const role = req.user?.role;
    const id = Number(req.params.id);

    const bookingPlayer = await prisma.bookingPlayer.findFirst({
      where: {
        id,
        status: "BOOKED",
        ...(role === "ADMIN" ? {} : { userId: Number(userId) }),
      },
    });

    if (!bookingPlayer) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await prisma.bookingPlayer.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Cancel failed",
      error: error.message,
    });
  }
};

module.exports = {
  getBookingPage,
  joinBooking,
  listAllBookings,
  listMyBookings,
  cancelBooking,
};
