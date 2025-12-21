import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    console.log("Signup API Hit");
    try {
        const body = await req.json();
        console.log("Body parsed:", body);
        const { firstName, lastName, mobile, password } = body;

        if (!firstName || !lastName || !mobile || !password) {
            console.log("Missing fields");
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectToDatabase();
        console.log("DB Connected");

        // Check if user already exists (by mobile)
        const existingUser = await User.findOne({ mobile });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this mobile number already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("Password hashed");

        const newUser = await User.create({
            firstName,
            lastName,
            mobile,
            password: hashedPassword,
            status: 'pending', // Explicitly set pending status
            stats: {
                totalContentAttended: 0,
                bestScore: 0,
                level: 1
            }
        });

        console.log("User created:", newUser._id);
        return NextResponse.json(
            { message: 'User created successfully', userId: newUser._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
