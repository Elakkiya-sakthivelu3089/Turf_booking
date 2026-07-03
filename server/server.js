const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const bookingRouter = require("./src/routes/bookingRoutes");
const userRoutes = require("./src/routes/userRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/bookings",bookingRouter);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
