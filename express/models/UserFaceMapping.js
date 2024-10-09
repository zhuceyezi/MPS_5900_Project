// models/UserFaceMapping.js
const {DataTypes} = require("sequelize");
const {database} = require("../config/databaseSetUp");

const UserFaceMapping = database.define('UserFaceMapping', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    faceId: {
        type: DataTypes.STRING,
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
                                            underscored: true
                                        });

module.exports = UserFaceMapping;