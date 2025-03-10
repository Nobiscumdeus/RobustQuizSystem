const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');
const Department = require('./department');

class Student extends Model {}

Student.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    matric_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    name: {
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
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true
});

module.exports = Student;