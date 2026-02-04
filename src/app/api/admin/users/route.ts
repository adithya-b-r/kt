import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to verify admin
async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        await connectToDatabase();
        const user = await User.findById(decoded.userId);
        if (user && user.role === 'admin') return user;
        return null;
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let query = {};
        if (search) {
            query = {
                $or: [
                    { first_name: { $regex: search, $options: 'i' } },
                    { last_name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query).select('-password_hash').sort({ created_at: -1 });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
