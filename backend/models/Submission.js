import mongoose from 'mongoose';

const submissionSchema= new mongoose.Schema({
    //this ties the submission to a specific challenge ID
    challenge:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Challenge',
        required:true
    },//the ref:challenge is powerful as it can copy all the data of challenge into the specified submission using a mongoose feature called .populate()
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
        //the enum array here blocks any status that isn't pending/approved/rejected
        default:'pending' //can be changed later by admin or prof
    },
    isFavourite:{
        type:Boolean,
        default:false
    }
},{timestamps:true})//this helps save when it was created to help in keeping time of submission and accounting for late submissions

export default mongoose.model('Submission',submissionSchema);