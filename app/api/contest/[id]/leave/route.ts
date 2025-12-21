
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Contest from '@/models/Contest';

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

        // 2. Find Contest & User
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 3. Check if user is actually in the contest
        if (!user.joinedContests.includes(contestId)) {
            return NextResponse.json({ success: false, error: 'User is not part of this contest' }, { status: 400 });
        }

        // 4. Check 24-hour restriction
        const currentTime = new Date();
        const startTime = new Date(contest.startTime);
        const timeDiff = startTime.getTime() - currentTime.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            return NextResponse.json({
                success: false,
                error: 'Cannot leave contest within 24 hours of start time'
            }, { status: 400 });
        }

        // 5. Update DB
        // Remove from user
        user.joinedContests = user.joinedContests.filter((id: any) => id.toString() !== contestId);
        await user.save();

        // Increment slots
        contest.slots += 1;
        await contest.save();

        return NextResponse.json({ success: true, message: 'Successfully left contest' });

    } catch (error: any) {
        console.error('Leave Contest Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}
