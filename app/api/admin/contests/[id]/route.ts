
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import '@/models/Question'; // Helper to ensure model registration for populate

// GET Single Contest
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const contest = await Contest.findById(params.id).populate('questions');
        if (!contest) {
            return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: contest }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching contest:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch contest' }, { status: 500 });
    }
}

// UPDATE Contest
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const body = await request.json();

        // If trying to publish (Active), validate questions
        if (body.status === 'Active') {
            const currentContest = await Contest.findById(params.id);
            if (!currentContest) {
                return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
            }
            if (!currentContest.questions || currentContest.questions.length === 0) {
                return NextResponse.json({ success: false, error: 'Cannot publish a contest with no questions' }, { status: 400 });
            }
        }

        const contest = await Contest.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });

        if (!contest) {
            return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: contest }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update contest' }, { status: 500 });
    }
}

// DELETE Contest
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const contest = await Contest.findByIdAndDelete(params.id);
        if (!contest) {
            return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Contest deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete contest' }, { status: 500 });
    }
}
