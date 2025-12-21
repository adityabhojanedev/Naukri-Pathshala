
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();

        const user = await User.findById(params.id);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        user.warningCount = (user.warningCount || 0) + 1;

        if (user.warningCount === 2) {
            const suspensionDate = new Date();
            suspensionDate.setDate(suspensionDate.getDate() + 3);
            user.suspensionEndDate = suspensionDate;
        } else if (user.warningCount >= 3) {
            const banDate = new Date();
            banDate.setMonth(banDate.getMonth() + 1);
            user.suspensionEndDate = banDate;
            // Optionally set isBanned if you want to flag them as "banned" vs just suspended
            // user.isBanned = true; 
        }

        await user.save();

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to warn user' }, { status: 500 });
    }
}
