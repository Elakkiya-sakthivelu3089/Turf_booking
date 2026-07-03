const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@turfbooking.com" },
    });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@turfbooking.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✓ Admin user created successfully");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: admin123`);
  } catch (error) {
    console.error("✗ Seed error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
