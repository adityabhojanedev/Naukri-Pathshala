import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';

export async function GET() {
    try {
        await dbConnect();

        const contests = await Contest.find({
            status: { $in: ['Active', 'Upcoming'] } // Only show active or upcoming contests
        })
            .select('title startTime duration difficulty category status slots') // Select necessary fields
            .sort({ startTime: 1 }); // Sort by start time

        return NextResponse.json({ success: true, data: contests });
    } catch (error: any) {
        console.error('Failed to fetch contests:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch contests' }, { status: 500 });
    }
}
