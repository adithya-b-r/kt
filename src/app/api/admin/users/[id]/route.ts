import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to verify admin (Duplicated for now, ideally in a lib)
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        // Security: Don't allow changing own role to user (prevent lockout) if you are the only admin?
        // For now, simple check:
        if (id === String(admin._id) && body.role && body.role !== 'admin') {
             return NextResponse.json({ message: 'Cannot demote yourself' }, { status: 400 });
        }

        const updateData: any = { ...body };
        
        // Handle password update specifically
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password_hash');

        return NextResponse.json(updatedUser);
    } catch (error) {
         console.error('Admin Update Error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
