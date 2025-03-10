const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database');
const Student = require('./student');
const Exam = require('./exam');

class ExamResult extends Model {}

ExamResult.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Student,
            key: 'id'
        }
    },
    exam_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Exam,
            key: 'id'
        }
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answers_submitted: {
        type: DataTypes.JSONB,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'ExamResult',
    tableName: 'exam_results',
    timestamps: true
});

module.exports = ExamResult;