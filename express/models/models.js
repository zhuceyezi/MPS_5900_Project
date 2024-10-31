const {database} = require("../config/databaseSetUp");
const Employee = require("./Employee");
const UserFaceMapping = require("./UserFaceMapping");
const Feedback = require("./Feedback");

module.exports = {
    database,
    Employee,
    UserFaceMapping,
    Feedback
};