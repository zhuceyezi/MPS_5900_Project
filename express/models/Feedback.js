const {database} = require("../config/databaseSetUp");
const {DataTypes} = require("sequelize");

const Feedback = database.define("Feedback", {
    employeeKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employee',
            key: 'key'
        },
        OnDelete: 'CASCADE',
        unique: true
    },
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
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