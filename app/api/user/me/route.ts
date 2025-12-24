import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Dynamically import models to ensure they are registered on the active connection
        const User = (await import('@/models/User')).default;
        // Ensure Contest model is registered for population
        await import('@/models/Contest');

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Fetching user profile for:", decoded.userId);

        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate({
                path: 'joinedContests',
                select: 'title startTime endTime duration difficulty category status slots description supportedLanguages',
                options: { sort: { startTime: -1 } }
            });

        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });

    } catch (error: any) {
        console.error("User fetch error:", error);
        return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
    }
}
