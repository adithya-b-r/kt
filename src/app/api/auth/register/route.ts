import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import FamilyTree from '@/models/FamilyTree';
import { getLocationFromIp } from '@/lib/location';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { first_name, middle_name, last_name, email, password } = body;

        if (!first_name || !last_name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists with this email' },
                { status: 409 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const ip = request.headers.get('x-forwarded-for') || 'Unknown';
        const finalIp = ip === '::1' ? '127.0.0.1 (Localhost)' : ip;
        const location = await getLocationFromIp(ip);

        const newUser = await User.create({
            first_name,
            middle_name,
            last_name,
            email,
            password_hash,
            last_login: new Date(),
            last_ip: finalIp,
            last_location: location,
        });

        await FamilyTree.create({
            user_id: newUser._id,
            name: `${first_name}'s Family Tree`,
            description: 'My first family tree',
        });

        const userResponse = {
            _id: newUser._id,
            first_name: newUser.first_name,
            middle_name: newUser.middle_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: 'user',
            plan_type: 'free',
            tree_limit: 75, // Default limit for new users
            last_login: newUser.last_login,
            last_ip: newUser.last_ip,
        };

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

        const res = NextResponse.json({
            message: 'User registered successfully',
            user: userResponse,
        });

        res.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return res;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
