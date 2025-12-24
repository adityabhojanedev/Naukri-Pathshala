import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Question from '@/models/Question';
import Result from '@/models/Result';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;
        const { id: contestId } = await params;

        const contest = await Contest.findById(contestId);
        if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

        // TIME CHECK: Only allow if contest ended or status is completed
        const now = new Date();
        // Check if date is passed OR status is completed
        if (new Date(contest.endTime) > now && contest.status !== 'completed') {
            return NextResponse.json({ error: "Analysis Locked" }, { status: 403 });
        }

        // Fetch User's Result to overlay answers
        const userResult = await Result.findOne({ contestId, userId });

        // Fetch Questions with Details for Analysis
        const questions = await Question.find({ _id: { $in: contest.questions } });

        return NextResponse.json({
            success: true,
            questions, // Now includes correctOption and explanation
            userAnswers: userResult ? userResult.answers : {},
            score: userResult ? userResult.score : 0
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
