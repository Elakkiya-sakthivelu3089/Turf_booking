const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.listUsers = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "User list failed", error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = Number(req.params.id || req.user?.id);

    if (req.user?.role !== "ADMIN" && id !== Number(req.user?.id)) {
      return res.status(403).json({ message: "You can only view your own details" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        createdAt: true,
        joinedTeams: {
          where: { status: "BOOKED" },
          include: {
            booking: {
              include: {
                game: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "User detail failed", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { name, email, password, phone, position, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        position,
        role: role || "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "User create failed", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id || req.user?.id);

    if (req.user?.role !== "ADMIN" && id !== Number(req.user?.id)) {
      return res.status(403).json({ message: "You can only edit your own details" });
    }

    const { name, email, password, phone, position, role } = req.body;

    const data = {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(role !== undefined && req.user?.role === "ADMIN" ? { role } : {}),
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "User update failed", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (req.user?.role !== "ADMIN" && id !== Number(req.user?.id)) {
      return res.status(403).json({ message: "You can only delete your own account" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookingPlayer.deleteMany({
        where: { userId: id },
      });

      await tx.user.delete({
        where: { id },
      });
    });

    res.json({ message: "User and active bookings deleted" });
  } catch (error) {
    res.status(500).json({ message: "User delete failed", error: error.message });
  }
};
