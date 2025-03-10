const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');
const Department = require('./department');

class Exam extends Model {}

Exam.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Department,
            key: 'id'
        }
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false // in minutes
    },
    access_code: {
        type: DataTypes.STRING(10),
        unique: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Exam',
    tableName: 'exams',
    timestamps: true
});

module.exports = Exam;