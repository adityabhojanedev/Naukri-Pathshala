import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide a first name'],
        maxlength: [60, 'First name cannot be more than 60 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Please provide a last name'],
        maxlength: [60, 'Last name cannot be more than 60 characters'],
    },
    email: { // Keeping email as optional/secondary since mobile is requested, or should it be removed? User asked for "first name, last name, mobile and password" specifically. I'll keep email as it's standard but make it optional if needed, or ask. User said "mentioned... these fields should be there", implies ONLY these? I'll keep email as it was in previous prompt.
        type: String,
        // unique: true, // If user didn't ask for email, maybe I should remove it? The previous prompt had it. "first name, last name, mobile and password these fields should be there". I will assume email is NOT required based on strict reading, but usually vital. I'll keep it as optional for now or inferred. Wait, the user didn't say "remove email", just "these fields should be there". Login usually requires email or mobile. I'll add mobile and keep email but maybe not required? No, I'll add mobile as required.
        // actually, let's stick to the list: firstName, lastName, mobile, password.
        // But login usually uses email. I'll include email as per standard but if user insists on ONLY those, I might drop it.
        // Let's add 'mobile' and keep 'email' for now.
        required: false,
    },
    mobile: {
        type: String,
        required: [true, 'Please provide a mobile number'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending',
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    warningCount: {
        type: Number,
        default: 0,
    },
    suspensionEndDate: {
        type: Date,
        default: null,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    stats: {
        totalContentAttended: {
            type: Number,
            default: 0,
        },
        bestScore: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
    },
    joinedContests: [{
        type: Schema.Types.ObjectId,
        ref: 'Contest'
    }],
    completedContests: [{
        type: Schema.Types.ObjectId,
        ref: 'Contest'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Force recompilation in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    if (models.User) {
        delete models.User;
    }
}

const User = models.User || model('User', UserSchema);

export default User;
