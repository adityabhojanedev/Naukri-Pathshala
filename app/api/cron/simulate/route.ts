import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Contest from '@/models/Contest';
import Result from '@/models/Result';

// Valid dummy names provided by user
const DUMMY_NAMES = [
    "Aditya Patil", "Sneha Deshmukh", "Rahul Jadhav", "Pooja Kulkarni",
    "Saurabh Shinde", "Neha Pawar", "Amit Bhosale", "Priyanka Chavan",
    "Rohit Joshi", "Kiran More", "Shubham Gaikwad", "Vaishali Sawant",
    "Akash Mahajan", "Rutuja Kadam", "Nikhil Gokhale", "Sonali Patwardhan",
    "Pratik Kharat", "Aishwarya Mhatre", "Yogesh Salunkhe", "Anjali Vaidya"
];

// Deterministic Dummy Generation
// We use a predefined mobile range: 9999900000 to 9999900019
const DUMMY_MOBILE_PREFIX = "99999000";

// A dummy hash for "password123" (avoiding bcrypt dependency if possible, or just using a string if auth allows)
// Assuming standard bcrypt hash for 'password123'
const DUMMY_PASSWORD_HASH = "$2b$10$YourDummyHashHereForPassword123";

async function ensureDummyUsers() {
    const createdUsers = [];

    for (let i = 0; i < DUMMY_NAMES.length; i++) {
        const fullName = DUMMY_NAMES[i];
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");
        const mobile = `${DUMMY_MOBILE_PREFIX}${i.toString().padStart(2, '0')}`;

        // Find by mobile OR email to be safe
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dummy.com`;
        let user = await User.findOne({
            $or: [{ mobile }, { email }]
        });

        if (!user) {
            try {
                user = await User.create({
                    firstName,
                    lastName,
                    mobile,
                    email,
                    password: DUMMY_PASSWORD_HASH,
                    isVerified: true,
                    role: 'user'
                });
                console.log(`Created dummy user: ${fullName}`);
            } catch (err: any) {
                console.warn(`Skipping dummy ${fullName}: ${err.message}`);
                // Try fetching again in case parallel race
                user = await User.findOne({ mobile });
            }
        }
        if (user) createdUsers.push(user);
    }
    return createdUsers;
}

export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Ensure Dummy Users Exist
        const dummyUsers = await ensureDummyUsers();
        const dummyUserIds = dummyUsers.map(u => u._id);

        const now = new Date();
        const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

        let logs = [];

        // ---------------------------------------------------------
        // ACTION 1: FILL ACTIVE CONTESTS (3 Hours before End)
        // ---------------------------------------------------------

        // Find Active contests ending within next 3 hours (and not already ended)
        const activeContests = await Contest.find({
            status: 'Active',
            endTime: { $gt: now, $lte: threeHoursFromNow }
        });

        for (const contest of activeContests) {
            // Calculate Fill Target
            // We need to count REAL participants first
            const participantsCount = await User.countDocuments({ joinedContests: contest._id });
            const currentSlots = contest.slots;
            const totalCapacity = participantsCount + currentSlots;

            const targetFill = Math.floor(totalCapacity * 0.80); // 80% target

            if (participantsCount < targetFill) {
                const needed = targetFill - participantsCount;

                // Find dummy users who are NOT in this contest
                // Note: filtering in-memory for simplicity given small list (20 users)
                // In production with thousands, use DB query
                const availableDummies = dummyUsers.filter(u => !u.joinedContests.includes(contest._id));

                // Take as many as needed (or available)
                const dummiesToAdd = availableDummies.slice(0, needed);

                if (dummiesToAdd.length > 0) {
                    const idsToAdd = dummiesToAdd.map(u => u._id);

                    // Bulk Update Users
                    await User.updateMany(
                        { _id: { $in: idsToAdd } },
                        { $push: { joinedContests: contest._id } }
                    );

                    // Update Contest Slots
                    contest.slots -= idsToAdd.length;
                    if (contest.slots < 0) contest.slots = 0;
                    await contest.save();

                    logs.push(`Added ${idsToAdd.length} dummies to contest "${contest.title}"`);
                }
            }
        }

        // ---------------------------------------------------------
        // ACTION 2: SCORE COMPLETED CONTESTS
        // ---------------------------------------------------------

        // Find Completed contests (recently ended, e.g., in last 24 hours to avoid reprocessing old ones forever)
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const completedContests = await Contest.find({
            status: 'Completed',
            endTime: { $gte: twentyFourHoursAgo }
        });

        for (const contest of completedContests) {
            // We find Users who have contest._id in joinedContests AND match the dummy pattern
            // Using regex ensuring it ends with @dummy.com
            const joinedDummies = await User.find({
                joinedContests: contest._id,
                email: { $regex: '@dummy\\.com$', $options: 'i' }
            });

            let scoredCount = 0;

            for (const dummy of joinedDummies) {
                // Check if result already exists
                const existingResult = await Result.findOne({ contestId: contest._id, userId: dummy._id });

                if (!existingResult) {
                    // Generate Random Score
                    // Logic: Random between -5 and max marks (questions * marksPerQuestion)
                    const totalQuestions = contest.questions?.length || 10;
                    const maxScore = totalQuestions * (contest.marksPerQuestion || 4);
                    const minPossible = totalQuestions * -(contest.negativeMarking || 1);

                    // Let's bias towards positive scores
                    const minScore = -2;
                    const randomScore = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;

                    // Generate Random Stats to loosely match score
                    // This is complex to perfect reverse-engineer, so we approximate
                    // We just randomize correct/wrong for visual flair
                    const correct = Math.floor(Math.abs(randomScore) / 4);
                    const wrong = Math.floor(Math.random() * (totalQuestions - correct));
                    const skipped = Math.max(0, totalQuestions - correct - wrong);

                    await Result.create({
                        userId: dummy._id,
                        contestId: contest._id,
                        score: randomScore,
                        timeTaken: Math.floor(Math.random() * ((contest.duration || 60) * 60)), // random time
                        answers: {}, // dummy answers
                        status: 'Submitted',
                        submittedAt: new Date(contest.endTime.getTime() - Math.random() * 600000), // submitted nearby end time
                        stats: {
                            correct,
                            wrong,
                            skipped,
                            totalQuestions: totalQuestions
                        }
                    });

                    // Mark as completed in User
                    await User.findByIdAndUpdate(dummy._id, {
                        $addToSet: { completedContests: contest._id }
                    });

                    scoredCount++;
                }
            }

            if (scoredCount > 0) {
                logs.push(`Generated scores for ${scoredCount} dummies in contest "${contest.title}"`);
            }
        }

        if (logs.length === 0) logs.push("No checks triggered (no relevant contests found).");

        return NextResponse.json({ success: true, logs });

    } catch (error: any) {
        console.error("Simulation Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
