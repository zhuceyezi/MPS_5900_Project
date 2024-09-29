const sequelize = require("../config/databaseSetUp");
const Employee = require("./Employee");

module.exports = {
  sequelize,
  Employee,
};
