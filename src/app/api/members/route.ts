import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Member from '@/models/Member';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const treeId = searchParams.get('treeId');
        
        if (!treeId) {
            return NextResponse.json({ message: 'Missing treeId parameter' }, { status: 400 });
        }

        await connectToDatabase();
        const members = await Member.find({ tree_id: treeId });

        return NextResponse.json(members);
    } catch (error) {
        console.error('Fetch members error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!body.tree_id || !body.first_name || !body.last_name) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();
        const newMember = await Member.create(body);

        return NextResponse.json(newMember);
    } catch (error) {
        console.error('Create member error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
