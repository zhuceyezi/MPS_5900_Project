const {database} = require("../config/databaseSetUp");
const Employee = require("./Employee");
const UserFaceMapping = require("./UserFaceMapping");
const Feedback = require("./Feedback");

Employee.hasOne(UserFaceMapping, {
    foreignKey: 'employeeKey',
    onDelete: 'CASCADE'
});

Employee.hasMany(Feedback, {
    foreignKey: 'employeeKey',
    onDelete: 'CASCADE'
});

module.exports = {
    database,
    Employee,
    UserFaceMapping,
    Feedback
};