import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=Google login failed', request.url));
    }

    try {
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('Google Token Error:', tokenData.error);
            return NextResponse.redirect(new URL('/login?error=Google auth failed', request.url));
        }

        // 2. Get User Info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userResponse.json();

        // 3. Connect DB & Find/Create User
        await connectToDatabase();

        let user = await User.findOne({ email: googleUser.email });

        if (user) {
            // Link Google ID if missing
            if (!user.googleId) {
                user.googleId = googleUser.id;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                first_name: googleUser.given_name,
                last_name: googleUser.family_name || googleUser.given_name, // Fallback if missing
                email: googleUser.email,
                googleId: googleUser.id,
                // No password_hash
                role: 'user',
                plan_type: 'free',
                tree_limit: 75,
                profile_completed: true,
                photo_url: googleUser.picture // Optional: if User model supported it, but it doesn't seem to explicitly?
            });
        }

        // 4. Update Tracking
        user.last_login = new Date();
        await user.save();

        // 5. Generate Token & Cookie
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/login?error=Internal server error', request.url));
    }
}
