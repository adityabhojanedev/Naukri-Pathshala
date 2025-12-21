import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Question from '@/models/Question';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const { questions } = await request.json();

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ success: false, error: 'No questions provided or invalid format' }, { status: 400 });
        }

        const contestId = params.id;
        console.log(`[API] Adding questions to contest: ${contestId} `);

        const contest = await Contest.findById(contestId);
        if (!contest) {
            console.error(`[API] Contest not found: ${contestId} `);
            return NextResponse.json({ success: false, error: 'Contest not found' }, { status: 404 });
        }

        const supportedLangs = contest.supportedLanguages || ['en'];

        // Validation for each question
        const validatedQuestions = [];
        for (const q of questions) {
            // Check languages
            const providedLangs = Object.keys(q.text || {});
            const validProvidedLangs = providedLangs.filter(lang => supportedLangs.includes(lang));

            const minRequired = Math.min(2, supportedLangs.length);

            if (validProvidedLangs.length < minRequired) {
                return NextResponse.json({
                    success: false,
                    error: `Each question must have text in at least ${minRequired} supported languages(${supportedLangs.join(', ')}).Found: ${validProvidedLangs.join(', ')} `
                }, { status: 400 });
            }

            validatedQuestions.push({
                contestId: new mongoose.Types.ObjectId(contestId), // Explicit cast
                text: q.text,
                options: q.options,
                correctOption: q.correctOption,
                explanation: q.explanation || {}
            });
        }

        // Bulk Insert
        console.log(`[API] Inserting ${validatedQuestions.length} questions...`);
        const createdQuestions = await Question.insertMany(validatedQuestions);
        console.log(`[API] Created ${createdQuestions.length} questions.IDs: `, createdQuestions.map(q => q._id));

        // Link to Contest
        const questionIds = createdQuestions.map(q => q._id);

        console.log(`[API] Linking questions to contest ${contestId}...`);
        const updatedContest = await Contest.findByIdAndUpdate(
            contestId,
            { $push: { questions: { $each: questionIds } } },
            { new: true }
        );

        if (updatedContest) {
            console.log(`[API] Contest updated.New questions count: ${updatedContest.questions.length} `);
        } else {
            console.error(`[API] FAILED to update contest ${contestId} with questions`);
        }

        return NextResponse.json({ success: true, count: createdQuestions.length, data: createdQuestions }, { status: 201 });

    } catch (error: any) {
        console.error('[API] Error adding questions:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to add questions' }, { status: 500 });
    }
}
