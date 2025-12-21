import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';
import User from '@/models/User';
import Contest from '@/models/Contest';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id: contestId } = await params;

        // Auth Check (Optional for public leaderboard, but needed for 'myResult')
        const authHeader = req.headers.get('Authorization');
        let userId = null;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
                userId = decoded.userId;
            } catch (e) { }
        }

        // Fetch Contest to check end time
        const contest = await Contest.findById(contestId);
        if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

        const now = new Date();
        const contestEnded = new Date(contest.endTime) < now;

        // Fetch Leaderboard (Top 50) - Existing Results
        const results = await Result.find({ contestId })
            .sort({ score: -1, submittedAt: 1 })
            .populate('userId', 'firstName lastName _id')
            .lean();

        // Fetch ALL users who joined this contest
        const joinedUsers = await User.find({ joinedContests: contestId })
            .select('firstName lastName _id')
            .lean();

        // Identify joined users who are NOT in results
        const resultUserIds = new Set(results.map((r: any) => r.userId._id.toString()));
        const absentUsers = joinedUsers.filter((u: any) => !resultUserIds.has(u._id.toString()));

        // Create mock results for absent users
        const absentResults = absentUsers.map((u: any) => ({
            _id: `absent_${u._id}`, // Fake ID
            userId: u,
            score: 0,
            timeTaken: 0,
            submittedAt: null,
            didNotAttend: true // Flag for UI
        }));

        // Combine and limit (if needed, but usually we want to show all for admin, maybe limit only applied for public if excessively large)
        // For now, let's keep limit 50 logic but applied AFTER merging if we want consistent pages.
        // However, if we append absent users at the bottom, we might miss them if results > 50.
        // The user wants to see absent users in ranking table.
        // If results > 50, absent users are effectively Rank 51+.
        // Let's concat and then slice.

        let leaderboard = [...results, ...absentResults];
        // Sort: High Score first. Absent users have 0, so they naturally fall to bottom (or mix with other 0 scorers).
        // If scores are equal, attended users should be higher? Or by name?
        // Let's sort: Score Desc, then didNotAttend (false first), then Name?
        leaderboard.sort((a: any, b: any) => {
            if (b.score !== a.score) return b.score - a.score;

            // Handle timeTaken: Lower is better.
            // But 0 (absent or legacy) should be treated as "Max".
            const timeA = a.timeTaken || Number.MAX_SAFE_INTEGER;
            const timeB = b.timeTaken || Number.MAX_SAFE_INTEGER;

            if (timeA !== timeB) return timeA - timeB;

            // If time is equal (e.g. both absent), sort by name
            const nameA = a.userId?.firstName || '';
            const nameB = b.userId?.firstName || '';
            return nameA.localeCompare(nameB);
        });

        // Apply limit if we want, OR just return all? Admin typically needs all. Public might be paginated.
        // User didn't ask for pagination, just "show absent users".
        // I'll increase limit or remove it?
        // Let's keep a reasonable limit (e.g. 100) or just return all for now since contests are small.
        // I will slice to 100 to be safe.
        leaderboard = leaderboard.slice(0, 100);

        // Fetch My Result
        let myResult = null;
        if (userId) {
            myResult = await Result.findOne({ contestId, userId }).lean();
        }

        return NextResponse.json({
            success: true,
            leaderboard,
            myResult,
            contestEnded
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
