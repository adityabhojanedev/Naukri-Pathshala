
import mongoose, { Schema, model, models } from 'mongoose';

const QuestionSchema = new Schema({
    contestId: {
        type: Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
    },
    subject: {
        type: String,
        required: false,
        default: 'General',
    },
    text: {
        type: Map,
        of: String, // { "en": "What is...?", "hi": "Kya hai...?" }
        required: true,
    },
    options: [{
        type: Map,
        of: String, // Array of localized option maps
    }],
    correctOption: {
        type: Number, // Index 0, 1, 2, 3
        required: true,
        min: 0,
        max: 3,
    },
    explanation: {
        type: Map,
        of: String,
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Question = models.Question || model('Question', QuestionSchema);

export default Question;
