const {DataTypes} = require("sequelize");
const {database} = require("../config/databaseSetUp");

const UserFaceMapping = database.define('UserFaceMapping', {
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: database.models.Employee.getTableName(),
            key: 'employee_id'
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
                                            // tableName: "employee_face_mapping",
                                            underscored: true
                                        });

module.exports = UserFaceMapping;