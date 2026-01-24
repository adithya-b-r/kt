import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FamilyTree from '@/models/FamilyTree';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'User ID required' }, { status: 400 });
        }

        await connectToDatabase();
        const trees = await FamilyTree.find({ user_id: userId });

        return NextResponse.json(trees);
    } catch (error) {
        console.error('List trees error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id, name, description } = body;

        if (!user_id || !name) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();
        const newTree = await FamilyTree.create({
            user_id,
            name,
            description
        });

        return NextResponse.json(newTree);
    } catch (error) {
        console.error('Create tree error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
