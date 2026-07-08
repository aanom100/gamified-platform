import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Challenge from './models/Challenge.js';


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
    const challenges = await Challenge.find({isActive: true}).sort({createdAt: -1});
    res.status(200).json(challenges)
    }
    catch(error){
        console.error(error)
        res.status(500).json({message:'No challenges active at the moment!'})
    }
})

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}...`)
})


