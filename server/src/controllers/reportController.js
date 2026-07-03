const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const toDateKey = (date) => new Date(date).toISOString().split("T")[0];

exports.getAdminReport = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const selectedDate = req.query.date ? new Date(req.query.date) : new Date();
    selectedDate.setHours(0, 0, 0, 0);

    const [users, games, bookings] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        orderBy: { name: "asc" },
      }),
      prisma.game.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      prisma.bookingPlayer.findMany({
        where: { status: "BOOKED" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          booking: {
            include: {
              game: {
                include: { category: true },
              },
            },
          },
        },
      }),
    ]);

    const dailyBookings = bookings.filter((item) => toDateKey(item.date) === toDateKey(selectedDate));
    const gameCounts = {};
    const slotCounts = {};

    bookings.forEach((item) => {
      const gameName = item.booking.game.name;
      const slotLabel = `${item.startTime} - ${item.endTime}`;
      gameCounts[gameName] = (gameCounts[gameName] || 0) + 1;
      slotCounts[slotLabel] = (slotCounts[slotLabel] || 0) + 1;
    });

    res.json({
      totals: {
        users: users.length,
        games: games.length,
        bookings: bookings.length,
        dailyBookings: dailyBookings.length,
      },
      mostPlayedGames: Object.entries(gameCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      mostPlayedSlots: Object.entries(slotCounts)
        .map(([slot, count]) => ({ slot, count }))
        .sort((a, b) => b.count - a.count),
      dailyBookings,
      users,
      games,
    });
  } catch (error) {
    res.status(500).json({ message: "Admin report failed", error: error.message });
  }
};

exports.getEmployeeReport = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const bookings = await prisma.bookingPlayer.findMany({
      where: {
        userId,
        status: "BOOKED",
      },
      include: {
        booking: {
          include: {
            game: {
              include: { category: true },
            },
            players: {
              where: { status: "BOOKED" },
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
    });

    res.json({
      totals: {
        bookings: bookings.length,
      },
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Employee report failed", error: error.message });
  }
};
