const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class School extends Model {}

School.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('medical', 'engineering', 'other'),
        defaultValue: 'medical'
    }
}, {
    sequelize,
    modelName: 'School',
    tableName: 'schools',
    timestamps: true
});

module.exports = School;