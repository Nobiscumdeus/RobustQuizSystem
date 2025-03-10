const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');
const School = require('./school');

class Department extends Model {}

Department.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        references: {
            model: School,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Department',
    tableName: 'departments',
    timestamps: true
});

module.exports = Department;