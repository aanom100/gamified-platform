import mongoose from 'mongoose';

const challengeSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    points:{
        type:Number,
        default:10
    },
    isActive:{
        type:Boolean,
        default:true
    }

},{timestamps:true})//this automatically adds 'created at' and 'updated at'

export default mongoose.model('Challenge',challengeSchema);