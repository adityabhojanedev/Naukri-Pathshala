
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await dbConnect();
        const body = await request.json();
        const { role, isVerified, isBanned, suspensionEndDate } = body;

        const updateData: any = {};
        if (role) updateData.role = role;
        if (typeof isVerified === 'boolean') {
            updateData.isVerified = isVerified;
            if (isVerified) {
                updateData.status = 'active';
            }
        }
        if (typeof isBanned === 'boolean') updateData.isBanned = isBanned;
        if (suspensionEndDate) updateData.suspensionEndDate = suspensionEndDate;

        const user = await User.findByIdAndUpdate(params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
    }
}
