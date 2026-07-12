import jwt from 'jsonwebtoken';

const auth=(req,res,next)=>{
    const token=req.header('x-auth-token');
    if(!token){
        return res.status(401).json({message:'No token found!!'})
    }
    try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    //this decoded contains the user ID and role so we give it to the req to pass it to the next function
    req.user=decoded;
    next();
    }
    catch(error){
        res.status(400).json({error:'Ticket is invalid or expired.'})
    }
}
export default auth;