const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Make sure this path is correct

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user'), // Just 'user', as all are exam creators/managers
      defaultValue: 'user', // Default to 'user'
      allowNull: false,
    },
    // Relationship to students, as this 'user' is the one registering and managing students
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize, // Sequelize instance (database connection)
    modelName: 'User',
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

module.exports = User;
