
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';

import Question from '@/models/Question';

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

        // Separate questions from contest body
        const { questions, ...contestData } = body;

        // 1. Create Contest
        const contest = await Contest.create(contestData) as any;

        // 2. Create Questions if provided
        if (questions && Array.isArray(questions) && questions.length > 0) {
            const questionDocs = questions.map((q: any) => ({
                ...q,
                contestId: contest._id
            }));

            const createdQuestions = await Question.insertMany(questionDocs);
            const questionIds = createdQuestions.map(q => q._id);

            // 3. Link Questions to Contest
            contest.questions = questionIds;
            await contest.save();
        }

        return NextResponse.json({ success: true, data: contest }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to create contest' }, { status: 500 });
    }
}
