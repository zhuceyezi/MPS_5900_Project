const sequelize = require("../config/databaseSetUp");
const { DataTypes } = require("sequelize");

const Employee = sequelize.define("Employee", {
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  imageId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  // This feild is used to store the employee id from company database system
  EmployeeId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Employee;
