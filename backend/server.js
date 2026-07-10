import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Challenge from './models/Challenge.js';
import Submission from './models/Submission.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


dotenv.config();
//the above line allows us to read variables in .env file and load them into the process.env object for use in our code

const app=express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
//the above middleware allows our frontend and backend which are on different ports to communicate to one another without the browser blocking the connection due to CORS


app.use(express.json());

//Database connection below
console.log("DEBUG - My URI is:", `[${process.env.MONGO_URI}]`);
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB successfully connected!')).catch((err)=>console.log('MongoDB connection error:',err))


app.post('/api/challenges',async (req,res)=>{
    try{
        const {title,description,points}=req.body;
    const newChallenge=new Challenge({
        title,
        description,
        points
    })
    await newChallenge.save();

    res.status(201).json(newChallenge);
    }
catch(error){
    console.error(error);
    res.status(500).json({error:'Failed to create challenge!'})
}
})

app.get('/api/challenges',async (req,res)=>{
    try{
    const challenges = await Challenge.find().sort({createdAt: -1});
    res.status(200).json(challenges)
    }
    catch(error){
        console.error(error)
        res.status(500).json({message:'No challenges active at the moment!'})
    }
})

app.post('/api/submissions', async(req,res)=>{
  const{challenge,studentName,contentURL}=req.body;
  
  try{
    const newSubmission= new Submission({
    challenge:challenge,
    studentName:studentName,
    contentURL:contentURL
  })
  await newSubmission.save()
  res.status(200).json(newSubmission)
}
catch(error){
    console.error(error)
    res.json(500).json({message:'Submission failed!'})
}
})
// GET ALL PENDING SUBMISSIONS
app.get('/api/submissions', async (req, res) => {
    try {
        // .populate() is Mongoose magic. It looks at the challenge ID, grabs the 
        // actual Challenge data (title, points), and bundles it together!
        const submissions = await Submission.find({ status: 'pending' })
            .populate('challenge') 
            .sort({ createdAt: 1 }); // Oldest first so the professor grades fairly
            
        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// APPROVE A SUBMISSION
app.put('/api/submissions/:id/approve', async (req, res) => {
    try {
        // Find the submission by the ID in the URL and change its status
        const updatedSubmission = await Submission.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { returnDocument: 'after' }
        );
        res.status(200).json(updatedSubmission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve submission' });
    }
});
app.post('/api/auth/register',async (req,res)=>{
    try{
        const{name,email,password,role}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({error:'Email is already registered!'})
        }
        //encrypting the password!!
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        //create user with new hashed password!
        const newUser=new User({
            name,
            email,
            password:hashesPassword,
            role:role || 'student'
        })
        await newUser.save();
        res.status(201).json({message:'user registered successfully!'})
    }catch(error){
        console.error('registration error,error');
        res.status(500).json({error:'Server error during registration!'})
    }
})
//login the user
app.post('/api/auth/login',async(req,res)=>{
    try{
        const{email,password}=req.body;

        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({error:'Invalid email or password!'})
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({error:'Invalid email or password!'})
        }
        //generating the JWT
        const token=jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiratopm:'1d'})
        res.status(200).json({
            token,
            user:{
                id:user._id,
                name:user.name,
                role:user.role,
                xp:user.xp
            }
        })    
    }catch(error){
        console.error('login error',error);
        res.status(500).json({error:'Server error during login'})
    }
})

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}...`)
})


