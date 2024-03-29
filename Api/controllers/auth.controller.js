import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import  jwt  from "jsonwebtoken";

// Sign Up Route(Register)
export const signup = async (req, res, next) => 
{
    const {username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({username, email, password: hashedPassword});
    try{
        await newUser.save();
        res.status(201).json('user created successfully!');
    }
    catch(error)
    {
        next(errorHandler(550, 'User is already exists!'));
    }
};

//Sign in Route(Login)

export const signin = async (req, res, next) => 
{
    //Get the email and password of the user
    const {email, password } = req.body;
    
    
    try{
        
        //check the email of the user
        const validUser = await User.findOne({email});
        if(!validUser) return next(errorHandler(404, 'User not found!..'));

        //check the password of the user
        const validPassword = await bcryptjs.compareSync(password, validUser.password);
        if(!validPassword) return next(errorHandler(401, 'Invalid password or email please try again!..'));
        //create a cookie for the logged in user
        const token  = jwt.sign({id : validUser._id}, process.env.JWT_SECRET);
        //remove the password from the json message
        const {password: pass, ...rest} = validUser._doc;
        res.cookie('access_token', token, { httpOnly: true}).status(200).json(rest);
       
    }
    catch(error)
    {
        next(error);
    }
};