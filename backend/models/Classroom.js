import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    professor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    joinCode: { 
        type: String, 
        required: true, 
        unique: true // Every class gets a unique 6-digit code
    },
    // The students officially in the class
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    // The "Waiting Room" for students who typed the join code
    pendingRequests: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }] 
}, { timestamps: true });

export default mongoose.model('Classroom', classroomSchema);