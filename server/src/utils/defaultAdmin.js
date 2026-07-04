const bcrypt = require("bcryptjs");

const DEFAULT_ADMIN = {
  name: "Admin",
  email: "admin001@gmail.com",
  password: "admin123",
  role: "ADMIN",
};

const ensureDefaultAdmin = async (prisma) => {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== DEFAULT_ADMIN.role) {
      return prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: DEFAULT_ADMIN.role },
      });
    }

    return existingAdmin;
  }

  return prisma.user.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: await bcrypt.hash(DEFAULT_ADMIN.password, 10),
      role: DEFAULT_ADMIN.role,
    },
  });
};

module.exports = {
  DEFAULT_ADMIN,
  ensureDefaultAdmin,
};
