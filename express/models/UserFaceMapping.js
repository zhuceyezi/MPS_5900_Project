const {DataTypes} = require("sequelize");
const {database} = require("../config/databaseSetUp");

const UserFaceMapping = database.define('UserFaceMapping', {
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employee',
            key: 'id'
        }
    },
    faceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    imageId: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
                                            timestamps: false,
                                            tableName: "UserFaceMapping",
                                            underscored: true
                                        });

module.exports = UserFaceMapping;