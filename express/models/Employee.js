const {database} = require("../config/databaseSetUp");
const {DataTypes} = require("sequelize");

/**
 * @typedef {Object} EmployeeAttributes
 * @property {string|undefined} id
 * @property {string} employeeName
 * @property {string|undefined} employeeId
 * @property {Date} [lastLogin|undefined]
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
        allowNull: true,
        unique: true
    },
    employeeName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
    // This feild is used to store the employee id from company database system
    
}, {
                                     underscored: true
                                     // tableName: 'employee'
                                 });

module.exports = Employee;
