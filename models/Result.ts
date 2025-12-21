import mongoose, { Schema, model, models } from 'mongoose';

const ResultSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contestId: {
        type: Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    timeTaken: {
        type: Number, // In seconds
        default: 0
    },
    answers: {
        type: Map,
        of: Number, // questionId -> optionIndex
        required: true,
    },
    stats: {
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    startTime: {
        type: Date,
    },
    warningLabels: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['InProgress', 'Submitted'],
        default: 'Submitted' // Default for existing/legacy
    }
});

// Prevent duplicate submissions for the same contest/user if needed
ResultSchema.index({ userId: 1, contestId: 1 }, { unique: true });

const Result = models.Result || model('Result', ResultSchema);

export default Result;
