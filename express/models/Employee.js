const database = require("../config/databaseSetUp").database;
const {DataTypes} = require("sequelize");

/**
 *
 * @params ID AUTO NOT NULL
 * @params imageId NOT NULL,
 * @params name NOT NULL,
 * @params lastLogin DEFAULT NULL,
 * @params EmployeeId
 */
const Employee = database.define("Employee", {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    employeeName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
    // This feild is used to store the employee id from company database system
    
}, {underscored: true});

module.exports = Employee;
