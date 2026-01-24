import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        await dbConnect();
        
        const user = await User.findById(decoded.userId).select('-password_hash');
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const body = await request.json();
        
        await dbConnect();
        
        const profileCompleted = !!(
            body.date_of_birth &&
            body.place_of_birth &&
            body.current_location
        );
        
        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            {
                ...body,
                profile_completed: profileCompleted,
                updated_at: new Date(),
            },
            { new: true, runValidators: true }
        ).select('-password_hash');
        
        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            user: updatedUser,
            message: 'Profile updated successfully' 
        }, { status: 200 });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
