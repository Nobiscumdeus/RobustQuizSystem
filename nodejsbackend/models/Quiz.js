const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');

class Quiz extends Model {}

Quiz.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Quiz',
    tableName: 'quizzes',
    timestamps: true,
});

module.exports = Quiz;
