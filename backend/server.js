import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Challenge from './models/Challenge.js';
import Submission from './models/Submission.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from './middleware/auth.js';
import Classroom from './models/Classroom.js';


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

// 1. CREATE A CHALLENGE FOR A SPECIFIC CLASSROOM (PROFESSOR ONLY)
app.post('/api/classrooms/:classroomId/challenges', auth, async (req, res) => {
    try {
        // Role check
        if (req.user.role !== 'professor') {
            return res.status(403).json({ error: 'Access denied. Only professors can create challenges.' });
        }

        const { title, description, points } = req.body;
        const { classroomId } = req.params;

        // Build the challenge securely tied to the classroom parameter
        const newChallenge = new Challenge({
            title,
            description,
            points: points || 10,
            classroom: classroomId
        });

        await newChallenge.save();
        res.status(201).json(newChallenge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create challenge!' });
    }
});

// 2. GET ALL CHALLENGES LOCKED TO A SPECIFIC CLASSROOM
app.get('/api/classrooms/:classroomId/challenges', auth, async (req, res) => {
    try {
        const { classroomId } = req.params;

        // Only pull challenges that match this specific classroom ID
        const challenges = await Challenge.find({ classroom: classroomId })
            .sort({ createdAt: -1 });

        res.status(200).json(challenges);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'No challenges active at the moment!' });
    }
});

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
            password:hashedPassword,
            role:role || 'student'
        })
        await newUser.save();
        res.status(201).json({message:'user registered successfully!'})
    }catch(error){
        console.error('registration error',error);
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
        const token=jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'})
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
app.post('/api/classrooms/create',auth,async(req,res)=>{
    try{
        if(req.user.role!=='professor'){
            return res.status(403).json("error:Access only given to professors!")
        }
        const{name}=req.body;
        const joinCode=Math.random().toString(36).substring(2,8).toUpperCase();
        const newClassroom=new Classroom({
            name,
            professor:req.user.id,
            joinCode
        })
        await newClassroom.save();
        res.status(201).json({message:'Classroom created',classroom:newClassroom})
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Server error while creating classroom!'})
    }

})

app.post('/api/classrooms/join',auth ,async(req,res)=>{
    try{
        if(req.user.role!=='student'){
            return res.status(403).json({error:'Only students can join!'})
        }
        const{joinCode}=req.body;

        const classroom=await Classroom.findOne({joinCode:joinCode.toUpperCase()})
        if(!classroom){
            return res.status(404).json({error:'Classroom not found!!'})
        }
        if(classroom.students.includes(req.user.id)|| classroom.pendingRequests.includes(req.user.id)){
            return res.status(400).json({error:'You are already in this class or have a pending request.'})
        }
        classroom.pendingRequests.push(req.user.id);
        await classroom.save();
        res.status(200).json({message:'Join request sent to professor!'})
    }
    catch(error){
        console.error(error)
            res.status(500).json({error:'Server error while requesting to join!'})
        }
    })

// APPROVE A STUDENT TO JOIN A CLASSROOM
app.post('/api/classrooms/:classroomId/approve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ error: 'Access denied. Professors only.' });
        }

        const { classroomId } = req.params;
        const { studentId } = req.body;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found.' });
        }

        // SAFE COMPARISON: Convert ObjectId to String using .toString()
        const isPending = classroom.pendingRequests.some(id => id.toString() === studentId);
        
        if (!isPending) {
            return res.status(400).json({ error: 'Student is not in the waiting room.' });
        }

        // 1. Remove from waiting room (filter out strings)
        classroom.pendingRequests = classroom.pendingRequests.filter(
            id => id.toString() !== studentId
        );

        // 2. Add to official student roster if not already there
        if (!classroom.students.map(id => id.toString()).includes(studentId)) {
            classroom.students.push(studentId);
        }

        await classroom.save();
        res.status(200).json({ message: 'Student approved successfully!' });
    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).json({ error: 'Failed to approve student.' });
    }
});
// GET A PROFESSOR'S CLASSROOMS
app.get('/api/classrooms/me', auth, async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        // Find all classrooms where the professor ID matches the logged-in user
        const classrooms = await Classroom.find({ professor: req.user.id })
              .populate('pendingRequests','name email')
              .populate('students','name email')
        res.status(200).json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch classrooms' });
    }
});
// GET A STUDENT'S ENROLLED CLASSROOMS
app.get('/api/classrooms/enrolled', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Access denied. Students only.' });
        }
        
        // Find classes where this user's ID exists in the 'students' array
        const classrooms = await Classroom.find({ students: req.user.id });
        res.status(200).json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch enrolled classes' });
    }
});
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}...`)
})


