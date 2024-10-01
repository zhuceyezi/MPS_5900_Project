const { Sequelize } = require("sequelize");
require("dotenv").config("../../.env");

// create a new instance to connect to the database
// use .env file to store sensitive data for best practices
console.log(process.env.DB_PASSWORD);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

exports.database = sequelize;
