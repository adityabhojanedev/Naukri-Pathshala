import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id: contestId } = await params;
        const { reason } = await req.json();

        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        // Find Result and update warningLabels
        const result = await Result.findOne({ contestId, userId });

        if (!result) {
            return NextResponse.json({ success: false, error: 'Result not found' }, { status: 404 });
        }

        // Add reason to warningLabels
        // We can limit duplicates or just push everything. 
        // User said "show reasoon it can be anything tab switched, leave in between etc etc".
        // Push with timestamp? Or just text. Text is simpler for now.

        // Use $push
        await Result.findByIdAndUpdate(result._id, {
            $push: { warningLabels: reason || 'Unknown Warning' }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
