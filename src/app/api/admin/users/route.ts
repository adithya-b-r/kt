import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import FamilyTree from '@/models/FamilyTree';
import Member from '@/models/Member';
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

        const users = await User.find(query).select('-password_hash').sort({ created_at: -1 }).lean();

        // Enrich users with tree and member info
        const enrichedUsers = await Promise.all(users.map(async (user: any) => {
            const tree = await FamilyTree.findOne({ user_id: user._id }).select('_id updated_at').lean();
            
            let memberCount = 0;
            let rootMemberName = 'N/A';
            let treeLastUpdated = user.updated_at; // Default to user update

            if (tree) {
                memberCount = await Member.countDocuments({ tree_id: tree._id });
                const rootMember = await Member.findOne({ tree_id: tree._id, is_root: true }).select('first_name last_name').lean();
                if (rootMember) {
                    rootMemberName = `${rootMember.first_name} ${rootMember.last_name}`;
                }
                treeLastUpdated = tree.updated_at;
            }

            return {
                ...user,
                memberCount,
                rootMemberName,
                treeLastUpdated,
            };
        }));

        return NextResponse.json(enrichedUsers);
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
