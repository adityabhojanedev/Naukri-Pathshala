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
        const url = new URL(req.url);
        const contestIdQuery = url.searchParams.get('contestId');

        // Handle "Absent" Users (No Result Document)
        if (resultId.startsWith('absent_')) {
            const userId = resultId.split('_')[1];

            if (!contestIdQuery) {
                return NextResponse.json({ success: false, error: 'Contest ID required for absent users' }, { status: 400 });
            }

            // Remove from Joined Contests (effectively "un-joining" them)
            await User.findByIdAndUpdate(userId, {
                $pull: { joinedContests: contestIdQuery }
            });

            return NextResponse.json({ success: true, message: 'Absent user removed from contest' });
        }

        // Normal Result Deletion
        // Find result to get userId and contestId
        const result = await Result.findById(resultId);
        if (!result) {
            return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
        }

        const { userId, contestId } = result;

        // Delete Result
        await Result.findByIdAndDelete(resultId);

        // Update User: Remove from completedContests
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
