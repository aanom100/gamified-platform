import mongoose, { Schema } from 'mongoose'

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['student','professor'],
        default:'student'
    },
    xp:{
        type:Number,
        default:0
    },
    classroom:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Classroom'
    }]
    //here we used [] in classroom as it shows classroom will have not one item but a whole array as one student can join more than one classroom
},{timestamps:true})

export default mongoose.model('User',userSchema);