import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Contest from '@/models/Contest';
import Question from '@/models/Question';
import Result from '@/models/Result';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // 1. Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { id: contestId } = await params;

        // 2. Parse Body
        const { answers, timeTaken } = await req.json(); // answers: { "questionId": optionIndex }

        // 3. Prevent duplicate submission (if already submitted)
        const existingResult = await Result.findOne({ userId, contestId });
        if (existingResult && existingResult.status === 'Submitted') {
            return NextResponse.json({ success: false, error: 'Already submitted' }, { status: 400 });
        }

        // 4. Fetch Contest and Questions
        const contest = await Contest.findById(contestId);
        if (!contest) return NextResponse.json({ error: 'Contest not found' }, { status: 404 });

        // Fetch all questions for this contest
        const questions = await Question.find({ _id: { $in: contest.questions } });

        // 5. Calculate Score
        let score = 0;
        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        questions.forEach((question) => {
            const userAns = answers[question._id.toString()];

            if (userAns !== undefined && userAns !== null) {
                if (userAns === question.correctOption) {
                    score += 4;
                    correct++;
                } else {
                    score -= 1;
                    wrong++;
                }
            } else {
                skipped++;
            }
        });

        // 6. Save (Update or Create) Result
        let result;
        if (existingResult) {
            result = await Result.findByIdAndUpdate(existingResult._id, {
                score,
                timeTaken: timeTaken || 0,
                answers,
                status: 'Submitted',
                submittedAt: new Date(),
                stats: {
                    correct,
                    wrong,
                    skipped,
                    totalQuestions: questions.length
                }
            }, { new: true });
        } else {
            result = await Result.create({
                userId,
                contestId,
                score,
                timeTaken: timeTaken || 0,
                answers,
                status: 'Submitted',
                submittedAt: new Date(),
                stats: {
                    correct,
                    wrong,
                    skipped,
                    totalQuestions: questions.length
                }
            });
        }

        // 7. Mark as Completed for User
        // We add to completedContests. We do NOT remove from joinedContests so it stays in their list, 
        // but frontend will verify "Completed" status via this new array or Result check.
        await User.findByIdAndUpdate(userId, {
            $addToSet: { completedContests: contestId },
            $inc: { 'stats.totalContentAttended': 1 } // Optional: increment stats
        });

        return NextResponse.json({ success: true, resultId: result._id, score });

    } catch (error: any) {
        console.error('Submit Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}
