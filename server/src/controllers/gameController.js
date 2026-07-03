const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createGame = async (req, res) => {
  try {
    const { name, categoryId, headId, teamALimit, teamBLimit, isActive } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        message: "Game name and category are required",
      });
    }

    const game = await prisma.game.create({
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        headId: headId ? Number(headId) : null,
        teamALimit: teamALimit ? Number(teamALimit) : 1,
        teamBLimit: teamBLimit ? Number(teamBLimit) : 1,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    res.status(201).json({
      message: "Game created",
      game,
    });
  } catch (error) {
    console.error("Game create failed:", error);
    res.status(500).json({
      message: "Game create failed",
      error: error.message,
    });
  }
};

exports.getGames = async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        category: true,
        head: true,
      },
    });

    res.json(games);
  } catch (error) {
    console.error("Game list failed:", error);
    res.status(500).json({ message: "Game list failed", error: error.message });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, headId, teamALimit, teamBLimit, isActive } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        message: "Game name and category are required",
      });
    }

    const game = await prisma.game.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        headId: headId ? Number(headId) : null,
        teamALimit: teamALimit ? Number(teamALimit) : 1,
        teamBLimit: teamBLimit ? Number(teamBLimit) : 1,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    res.json({
      message: "Game updated",
      game,
    });
  } catch (error) {
    console.error("Game update failed:", error);
    res.status(500).json({ message: "Game update failed", error: error.message });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.game.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Game deleted" });
  } catch (error) {
    console.error("Game delete failed:", error);
    res.status(500).json({ message: "Game delete failed", error: error.message });
  }
};
