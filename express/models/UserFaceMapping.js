const {DataTypes} = require("sequelize");
const {database} = require("../config/databaseSetUp");

const UserFaceMapping = database.define('UserFaceMapping', {
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employee',
            key: 'id'
        },
        unique: true
    },
    faceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true
    },
    imageId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    }
}, {
                                            timestamps: false,
                                            tableName: "UserFaceMapping",
                                            underscored: true
                                        });

module.exports = UserFaceMapping;