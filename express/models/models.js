const {database} = require("../config/databaseSetUp");
const Employee = require("./Employee");
const UserFaceMapping = require("./UserFaceMapping");

module.exports = {
    database,
    Employee,
    UserFaceMapping
};
