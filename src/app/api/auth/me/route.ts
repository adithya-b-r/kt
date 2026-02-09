import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as any;
        } catch (e) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        if (!decoded?.userId) {
            return NextResponse.json(
                { message: 'Invalid token payload' },
                { status: 401 }
            );
        }

        await connectToDatabase();
        const user = await User.findById(decoded.userId).select('-password_hash');

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                _id: user._id,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                plan_type: user.plan_type,
                tree_limit: user.tree_limit,
                date_of_birth: user.date_of_birth,
            }
        });

    } catch (error) {
        console.error('Me API Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
