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

        // STRICT MODE: Check Submission Window
        console.log('--- STRICT CHECK DEBUG ---');
        console.log('StrictMode:', contest.strictMode);

        if (contest.strictMode) {
            // Fix Loophole: existingResult must exist to calculate time
            if (!existingResult || !existingResult.startTime) {
                return NextResponse.json({
                    success: false,
                    error: 'Strict Mode Violation: Could not verify exam start time. Please refresh and try again.'
                }, { status: 400 });
            }

            const submitWindow = contest.submitWindow || 10;
            const now = new Date();
            const startTime = new Date(existingResult.startTime);
            const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
            const durationSeconds = contest.duration * 60;
            const remainingSeconds = durationSeconds - elapsedSeconds;

            console.log('Elapsed:', elapsedSeconds);
            console.log('Window (sec):', (submitWindow * 60) + 30);

            // Allow submission only if remaining time is less than window (in seconds)
            // Buffer of 30 seconds for clock drift
            if (remainingSeconds > (submitWindow * 60) + 30) {
                console.log('BLOCKED: Too early');
                return NextResponse.json({
                    success: false,
                    error: `Strict Mode Violation: You can only submit in the last ${submitWindow} minutes.`
                }, { status: 403 });
            } else {
                console.log('ALLOWED: Within submission window');
            }
        }

        // Fetch questions based on the IDs the USER actually answered
        // This failsafe ensures that if an Admin modifies the contest (removes questions) 
        // while a user is taking the test, we still grade the questions the user answered.
        const submittedQuestionIds = Object.keys(answers);

        let questions: any[] = [];
        if (submittedQuestionIds.length > 0) {
            questions = await Question.find({ _id: { $in: submittedQuestionIds } });
        } else {
            // If user submitted nothing, or we want to support the case where they just didn't answer anything
            // but we still want to record the "skipped" stats, we can fallback to contest.questions
            questions = await Question.find({ _id: { $in: contest.questions } });
        }

        // 5. Calculate Score
        let score = 0;
        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        // We iterate over the FETCHED questions to ensure we have the correct answer key
        questions.forEach((question) => {
            const qId = question._id.toString();
            // Check if user answered this specific question
            if (answers.hasOwnProperty(qId)) {
                const userAns = answers[qId];

                if (userAns !== undefined && userAns !== null) {
                    if (userAns === question.correctOption) {
                        score += 4; // +4 for correct
                        correct++;
                    } else {
                        score -= 1; // -1 for wrong
                        wrong++;
                    }
                } else {
                    skipped++;
                }
            } else {
                // If the question was in the "questions" array but not in "answers" map?
                // Depending on logic, if we fetched only submitted questions, this won't happen often 
                // unless we fell back to contest.questions.
                skipped++;
            }
        });

        // If we only fetched submitted questions, 'skipped' might be artificially low regarding the Total Contest Questions.
        // We should calculate 'skipped' based on the Total Contest Questions count if possible, 
        // or just accept that "skipped" means "skipped within the set we are grading".
        // Better Approach for Stats:
        // Total Expected Questions = contest.questions.length (The current state of contest)
        // correct + wrong + skipped = Total Expected
        // So:
        const totalExpected = contest.questions.length;
        // Re-calculate skipped to reflect the TRUE contest state (what they missed)
        // skipped = totalQuestions - (correct + wrong)
        skipped = Math.max(0, totalExpected - (correct + wrong));

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
                    totalQuestions: totalExpected
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
                    totalQuestions: totalExpected
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
