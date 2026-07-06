import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
//the above line allows us to read variables in .env file and load them into the process.env object for use in our code

const app=express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
//the above middleware allows our frontend and backend which are on different ports to communicate to one another without the browser blocking the connection due to CORS


app.use(express.json());

app.get('/api/test',(req,res)=>{
    res.json({message:'The pipeline is successfully connected!'})
});

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}...`)
})