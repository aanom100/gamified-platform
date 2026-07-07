import mongoose from 'mongoose';

const submissionSchema= new mongoose.Schema({
    //this ties the submission to a specific challenge ID
    challenge:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Challenge',
        required:true
    },
    studentName:{
        type:String,
        required:true
    },
    contentURL:{
        type: String,
        required:true
    },
    status:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending' //can be changed later by admin or prof
    },
    isFavourite:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export default mongoose.model('Submission',submissionSchema);