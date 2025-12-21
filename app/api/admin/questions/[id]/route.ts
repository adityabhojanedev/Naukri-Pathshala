import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Question from '@/models/Question';
import Contest from '@/models/Contest';

// UPDATE Question
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const body = await request.json();

        const question = await Question.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true
        });

        if (!question) {
            return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: question });
    } catch (error: any) {
        console.error('Error updating question:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to update question' }, { status: 500 });
    }
}

// DELETE Question
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();

        // 1. Delete the Question document
        const question = await Question.findByIdAndDelete(params.id);
        if (!question) {
            return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
        }

        // 2. Remove reference from Contest
        // We assume the question maps back to a contest via contestId
        if (question.contestId) {
            await Contest.findByIdAndUpdate(question.contestId, {
                $pull: { questions: params.id }
            });
        }

        return NextResponse.json({ success: true, message: 'Question deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting question:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete question' }, { status: 500 });
    }
}
