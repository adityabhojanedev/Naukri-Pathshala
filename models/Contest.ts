
import mongoose, { Schema, model, models } from 'mongoose';

const ContestSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide a contest title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    instructions: {
        type: String,
        default: '',
    },
    startTime: {
        type: Date,
        required: [true, 'Please provide a start date and time'],
    },
    endTime: {
        type: Date,
        required: [true, 'Please provide an end date and time'],
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please provide contest duration in minutes'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Completed', 'Upcoming'],
        default: 'Draft',
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
    },
    slots: {
        type: Number,
        required: [true, 'Please provide number of slots'],
    },
    timePerQuestion: {
        type: Number, // in seconds
        required: [true, 'Please provide time per question in seconds'],
    },
    supportedLanguages: {
        type: [String], // e.g. ['en', 'hi', 'mr']
        default: ['en'],
        validate: {
            validator: function (v: string[]) {
                return v && v.length > 0;
            },
            message: 'A contest must support at least one language.'
        }
    },
    syllabus: {
        type: String,
        default: '',
    },
    marksPerQuestion: {
        type: Number,
        default: 4,
    },
    negativeMarking: {
        type: Number,
        default: 1, // Positive value representing deduction
    },
    strictMode: {
        type: Boolean,
        default: true,
    },
    submitWindow: {
        type: Number, // in minutes (e.g., 10 means allow submit only in last 10 mins)
        default: 10,
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Contest = models.Contest || model('Contest', ContestSchema);

export default Contest;
