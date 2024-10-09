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
        allowNull: false
    },
    imageId: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
                                            tableName: 'UserFaceMappings',
                                            timestamps: false,
                                            underscored: true
                                        });

module.exports = UserFaceMapping;