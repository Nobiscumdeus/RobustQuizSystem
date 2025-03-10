const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Adjust the path to your database configuration
const User = require('./user');  // Import the User model here

class Role extends Model {}

Role.init(
  {
    roleName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  // Ensures no two roles have the same name
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: 'Role',
    timestamps: true,  // Sequelize will handle createdAt and updatedAt
  }
);

// Many-to-many relationship (Role <-> User)
Role.belongsToMany(User, { through: 'UserRoles' });  // Role can belong to many users, through UserRoles

module.exports = Role;
