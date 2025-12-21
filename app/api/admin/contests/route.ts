
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';

export async function GET() {
    try {
        await dbConnect();
        const contests = await Contest.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: contests }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch contests' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic Validation
        if (!body.title || !body.startTime || !body.endTime || !body.duration) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const contest = await Contest.create(body);
        return NextResponse.json({ success: true, data: contest }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create contest' }, { status: 500 });
    }
}
