const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { DEFAULT_ADMIN, ensureDefaultAdmin } = require("../utils/defaultAdmin");

const {
  generateSlots,
  decoratePublicSlots,
  getPublicLinkStatus,
  isPublicBookableSlot,
} = require("../utils/slotUtils");

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getLinkExpiry = (date) => {
  const expiresAt = new Date(date);
  expiresAt.setHours(23, 59, 59, 999);
  return expiresAt;
};

const buildPublicLinkUrl = (req, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `${clientUrl.replace(/\/$/, "")}/employee-booking/${token}`;
};

const getValidBookingLink = async (token) => {
  if (!token) {
    throw new Error("Booking link token is required");
  }

  const link = await prisma.bookingLink.findUnique({
    where: { token },
  });

  if (!link || !link.isActive) {
    throw new Error("Booking link is invalid");
  }

  if (new Date() > link.expiresAt) {
    throw new Error("Booking link has expired");
  }

  return link;
};

const getBookingPage = async (req, res) => {
  try {
    const selectedDate = normalizeDate(req.query.date || new Date());
    const slots = decoratePublicSlots(generateSlots(), selectedDate);

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

const getPublicBookingPage = async (req, res) => {
  try {
    const link = await getValidBookingLink(req.params.token);
    const selectedDate = normalizeDate(link.date);
    const linkStatus = getPublicLinkStatus(selectedDate);

    if (linkStatus.isClosed) {
      return res.json({
        date: selectedDate,
        token: link.token,
        linkClosed: true,
        closesAt: linkStatus.closeAt,
        games: [],
      });
    }

    const slots = decoratePublicSlots(generateSlots(), selectedDate);

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
      token: link.token,
      linkClosed: false,
      closesAt: linkStatus.closeAt,
      games: formattedGames,
    });
  } catch (error) {
    console.log("PUBLIC BOOKING PAGE ERROR:", error);
    res.status(400).json({
      message: "Failed to load booking link",
      error: error.message,
    });
  }
};

const generatePublicBookingLink = async (req, res) => {
  try {
    await ensureDefaultAdmin(prisma);

    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    if (!req.body.date) {
      return res.status(400).json({
        message: "Booking date is required",
      });
    }

    const selectedDate = normalizeDate(req.body.date);
    const today = normalizeDate(new Date());

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot generate a link for a past date",
      });
    }

    const existingLink = await prisma.bookingLink.findUnique({
      where: { date: selectedDate },
    });

    const link =
      existingLink ||
      (await prisma.bookingLink.create({
        data: {
          token: crypto.randomBytes(18).toString("hex"),
          date: selectedDate,
          expiresAt: getLinkExpiry(selectedDate),
        },
      }));

    res.json({
      message: existingLink ? "Booking link already exists" : "Booking link generated",
      link: {
        id: link.id,
        token: link.token,
        date: link.date,
        expiresAt: link.expiresAt,
        url: buildPublicLinkUrl(req, link.token),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate booking link",
      error: error.message,
    });
  }
};

const registerPublicEmployee = async (req, res) => {
  try {
    const { name, position, email, phone } = req.body;
    const validPositions = ["FA", "CRE", "LA"];

    if (!name || !position || !email || !phone) {
      return res.status(400).json({
        message: "Name, position, email and phone number are required",
      });
    }

    if (!validPositions.includes(position)) {
      return res.status(400).json({
        message: "Please select a valid position",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.email === DEFAULT_ADMIN.email || existingUser.role === "ADMIN") {
        const admin = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name.trim(),
            position,
            phone: phone.trim(),
            role: "ADMIN",
          },
        });

        return res.json({
          message: "Admin details updated",
          employee: {
            id: admin.id,
            name: admin.name,
            position: admin.position,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
          },
        });
      }

      return res.status(400).json({
        message: "This email is already registered for booking",
      });
    }

    const employee = await prisma.user.create({
      data: {
        name: name.trim(),
        position,
        email: normalizedEmail,
        phone: phone.trim(),
        password: await bcrypt.hash(`employee-${Date.now()}-${normalizedEmail}`, 10),
        role: "EMPLOYEE",
      },
    });

    res.status(201).json({
      message: "Employee registered",
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
      },
    });
  } catch (error) {
    console.log("PUBLIC EMPLOYEE REGISTER ERROR:", error);
    res.status(500).json({
      message: "Employee registration failed",
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

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (!isPublicBookableSlot(startTime, endTime, selectedDate)) {
      return res.status(400).json({
        message: "This slot is closed for booking",
      });
    }

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

const joinPublicBooking = async (req, res) => {
  await ensureDefaultAdmin(prisma);

  let link;
  try {
    link = await getValidBookingLink(req.body.token);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  req.body.date = getLocalDateString(link.date);

  const employee = await prisma.user.findUnique({
    where: { id: Number(req.body.userId) },
    select: { id: true, role: true },
  });

  if (!employee || !["EMPLOYEE", "ADMIN"].includes(employee.role)) {
    return res.status(400).json({
      message: "Please register employee details before booking",
    });
  }

  return joinBooking(req, res);
};

const listAllBookings = async (req, res) => {
  try {
    await ensureDefaultAdmin(prisma);

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
  getPublicBookingPage,
  generatePublicBookingLink,
  registerPublicEmployee,
  joinPublicBooking,
  joinBooking,
  listAllBookings,
  listMyBookings,
  cancelBooking,
};
