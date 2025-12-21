
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

        if (!user.isVerified) {
            return NextResponse.json({ success: false, error: 'User is not verified' }, { status: 403 });
        }

        // 3. Check if already joined
        if (user.joinedContests.includes(contestId)) {
            return NextResponse.json({ success: true, message: 'Already joined' });
        }

        // 4. Check status & slots
        if (contest.slots <= 0) {
            return NextResponse.json({ success: false, error: 'Contest is full' }, { status: 400 });
        }

        // 5. Update DB
        // Add to user
        user.joinedContests.push(contestId);
        await user.save();

        // Decrement slots
        contest.slots -= 1;
        await contest.save();

        return NextResponse.json({ success: true, message: 'Successfully joined contest' });

    } catch (error: any) {
        console.error('Join Contest Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}
