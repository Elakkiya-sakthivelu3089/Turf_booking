const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const normalizedType = (type || name || "").trim().toUpperCase();

    if (!name || !["INDOOR", "OUTDOOR"].includes(normalizedType)) {
      return res.status(400).json({
        message: "Category name is required and type must be INDOOR or OUTDOOR",
      });
    }

    const normalizedName = name.trim().toUpperCase();

    const category = await prisma.category.upsert({
      where: {
        name: normalizedName,
      },
      update: {
        type: normalizedType,
      },
      create: {
        name: normalizedName,
        type: normalizedType,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Category create error:", error);
    res.status(500).json({
      message: "Category create failed",
      error: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        games: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("Category list error:", error);
    res.status(500).json({
      message: "Category list failed",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });

    res.json({
      message: "Category updated",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Category update failed" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Category delete failed" });
  }
};
