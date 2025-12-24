import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Result from '@/models/Result';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in environment variables');
            return NextResponse.json({ success: false, error: 'Configuration Error: MONGODB_URI is missing' }, { status: 500 });
        }

        await dbConnect();

        // 1. Optional Auth Check to determine "hasJoined"
        const authHeader = req.headers.get('Authorization');
        let userId = null;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                if (process.env.JWT_SECRET) {
                    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
                    userId = decoded.userId;
                }
            } catch (e) {
                // Invalid token, treat as guest
            }
        }

        // 2. Lazy Status Updates
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // A. Mark as Completed if endTime passed
        await Contest.updateMany(
            { endTime: { $lt: now }, status: { $ne: 'Completed' } },
            { $set: { status: 'Completed' } }
        );

        // B. Mark as Active if started and not ended
        await Contest.updateMany(
            {
                startTime: { $lte: now },
                endTime: { $gt: now },
                status: { $in: ['Upcoming', 'Draft'] }
            },
            { $set: { status: 'Active' } }
        );

        // C. Mark as Upcoming if starting soon (within 3 days) and currently Draft
        await Contest.updateMany(
            {
                startTime: { $lte: threeDaysFromNow, $gt: now },
                status: 'Draft'
            },
            { $set: { status: 'Upcoming' } }
        );

        // 3. Fetch Contests (Active & Upcoming)
        const contests = await Contest.find({
            status: { $in: ['Active', 'Upcoming'] }
        })
            .select('title startTime endTime duration difficulty category status slots description supportedLanguages')
            .sort({ startTime: -1 })
            .lean();

        // 3. Check specific status if user is logged in
        let data = contests;
        if (userId) {
            // Find user's joined contests
            const User = (await import('@/models/User')).default;
            const user = await User.findById(userId).select('joinedContests').lean();

            const joinedContestIds = new Set(
                (user?.joinedContests || []).map((id: any) => id.toString())
            );

            data = contests.map((contest: any) => ({
                ...contest,
                hasJoined: joinedContestIds.has(contest._id.toString())
            }));
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Failed to fetch contests detailed:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch contests',
            details: error.message,
            stack: error.stack,
            type: error.name
        }, { status: 500 });
    }
}
