const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');


//User registration route 
async function register(req,res){
    try{
        const { username,email,password,role}=req.body;
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            username,
            email,
            password:hashedPassword
        });
        //Assign the user a role by default eg student 
        const roleInstance=await  Role.findOne({where:{roleName:role || 'student'}});
        await user.addRole(roleInstance)

        res.status(201).json({message:'User registered successfully!!'});
    }catch(error){
        res.status(500).json({message:'Error registering user',error})
    }
}