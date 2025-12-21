import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';
import User from '@/models/User';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id: resultId } = await params;

        // Find result to get userId and contestId
        const result = await Result.findById(resultId);
        if (!result) {
            return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
        }

        const { userId, contestId } = result;

        // Delete Result
        await Result.findByIdAndDelete(resultId);

        // Update User: Remove from completedContests
        // This allows them to retake? Or should we keep it? 
        // "remove user from leaderboard" - usually implies disqualification. 
        // If we leave it in completedContests, they can't retake but won't have a result.
        // If we remove it, they can retake.
        // Let's remove from completedContests to be clean (effectively deleting the submission).
        // If admin wants to just ban, they can use Warning/Ban.
        await User.findByIdAndUpdate(userId, {
            $pull: { completedContests: contestId },
            $inc: { 'stats.totalContentAttended': -1 } // Optional: decrement stats
        });

        return NextResponse.json({ success: true, message: 'Result deleted' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id: resultId } = await params;
        const body = await req.json();
        const { score } = body;

        if (score === undefined || score === null) {
            return NextResponse.json({ error: 'Score is required' }, { status: 400 });
        }

        const result = await Result.findByIdAndUpdate(
            resultId,
            { score },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
