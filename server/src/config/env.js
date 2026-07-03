const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT || 5000,
};
