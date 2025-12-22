import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Result from '@/models/Result';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id: contestId } = await params;

        // Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        const contest = await Contest.findById(contestId);
        if (!contest) return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });

        // Check for existing result
        let result = await Result.findOne({ contestId, userId });
        let isRejoin = false;
        let timeLeft = 0;

        const now = new Date();
        const contestEndTime = new Date(contest.endTime);
        const maxDurationSeconds = contest.duration * 60;

        if (result) {
            // Re-joining logic
            isRejoin = true;
            if (result.status === 'Submitted') {
                return NextResponse.json({ success: false, error: 'Already submitted' }, { status: 400 });
            }

            // Calculate elapsed time
            const startTime = new Date(result.startTime || result.createdAt); // Fallback
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

            // Initial remaining time
            let remaining = maxDurationSeconds - elapsedSeconds;

            // Apply 40% Cap Rule for Re-join
            const capSeconds = Math.floor(maxDurationSeconds * 0.40);

            // If they have more than 40% left, cap it down to 40%
            // "allow only 40% of total time left" -> Assuming max allowed remaining is 40% of TOTAL duration.
            if (remaining > capSeconds) {
                remaining = capSeconds;
            }

            timeLeft = remaining;

        } else {
            // First time start
            const startTime = now;
            try {
                result = new Result({
                    userId,
                    contestId,
                    score: 0,
                    status: 'InProgress',
                    startTime: startTime,
                    answers: {},
                    warningLabels: []
                });
                await result.save();
                timeLeft = maxDurationSeconds;
            } catch (err: any) {
                // Handle Race Condition (Duplicate Key Error)
                if (err.code === 11000) {
                    // Result was created by another parallel request
                    result = await Result.findOne({ contestId, userId });
                    if (!result) throw err; // Should not happen if 11000 occurred

                    // Treat as Rejoin
                    isRejoin = true;
                    if (result.status === 'Submitted') {
                        return NextResponse.json({ success: false, error: 'Already submitted' }, { status: 400 });
                    }

                    // Calculate elapsed time for the existing result
                    const existingStartTime = new Date(result.startTime || result.createdAt);
                    const elapsedSeconds = Math.floor((now.getTime() - existingStartTime.getTime()) / 1000);
                    let remaining = maxDurationSeconds - elapsedSeconds;

                    // Apply 40% Cap Rule for Re-join (Same logic as above)
                    const capSeconds = Math.floor(maxDurationSeconds * 0.40);
                    if (remaining > capSeconds) {
                        remaining = capSeconds;
                    }
                    timeLeft = remaining;

                } else {
                    throw err;
                }
            }
        }

        // Also ensure timeLeft doesn't exceed absolute contest end time
        const secondsUntilEnd = Math.floor((contestEndTime.getTime() - now.getTime()) / 1000);
        if (timeLeft > secondsUntilEnd) {
            timeLeft = secondsUntilEnd;
        }

        if (timeLeft < 0) timeLeft = 0;

        return NextResponse.json({
            success: true,
            timeLeft,
            isRejoin,
            supportedLanguages: contest.supportedLanguages || ['en']
        });

    } catch (error: any) {
        console.error('Start contest error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
