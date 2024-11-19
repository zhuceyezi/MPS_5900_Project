const {database} = require("../config/databaseSetUp");
const {DataTypes} = require("sequelize");

const Feedback = database.define("Feedback", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    employeeKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employee',
            key: 'key'
        },
        OnDelete: 'NO ACTION'
    },
    content: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
    
    
}, {
                                     underscored: true,
                                     tableName: 'Feedback'
                                 });
module.exports = Feedback;