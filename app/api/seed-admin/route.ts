
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        const existingAdmin = await User.findOne({ mobile: '9999999999' });
        if (existingAdmin) {
            return NextResponse.json({ success: false, message: 'Admin already exists with mobile 9999999999' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const newAdmin = await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            mobile: '9999999999',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            status: 'active'
        });

        return NextResponse.json({ success: true, data: newAdmin, message: 'Admin user created. Mobile: 9999999999, Password: admin123' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to create admin: ' + error.message }, { status: 500 });
    }
}
