const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');
const Exam = require('./exam');

class ExamQuestion extends Model {}

ExamQuestion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    exam_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Exam,
            key: 'id'
        }
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    answers: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    correct_answer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ExamQuestion',
    tableName: 'exam_questions',
    timestamps: true
});

module.exports = ExamQuestion;