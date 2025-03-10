const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Adjust the path to your database configuration
const Quiz = require('./Quiz'); // Import the Quiz model
const User = require('./Users'); // Import the Quiz model

class Result extends Model {}

Result.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Quiz,
            key: 'id'
        }
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Result',
    tableName: 'results',
    timestamps: false
});
