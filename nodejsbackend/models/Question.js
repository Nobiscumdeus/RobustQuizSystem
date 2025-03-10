const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Adjust the path to your database configuration
const Quiz = require('./Quiz'); // Import the Quiz model

class Question extends Model {}

Question.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Quiz,
            key: 'id'
        }
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    options: {
        type: DataTypes.JSON, // Store options as JSON array
        allowNull: false
    },
    correct_answer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: false
});
