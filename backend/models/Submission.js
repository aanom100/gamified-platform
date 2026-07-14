import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    // Ties this submission to the specific challenge
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    // Tracks the student who submitted the code
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The proof of work link (e.g., GitHub repo, Vercel deployment, or Google Drive folder)
    submissionUrl: {
        type: String,
        required: true,
        trim: true
    },
    // Optional explanation, remarks, or notes from the student
    comment: {
        type: String,
        trim: true
    },
    // The current state of the submission in the grading pipeline
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // Score assigned by the professor (defaults to 0 until approved)
    pointsAwarded: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// A compound index to prevent a student from submitting multiple times to the same challenge
submissionSchema.index({ challenge: 1, student: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);