import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Relationship from '@/models/Relationship';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!body.tree_id || !body.person1_id || !body.person2_id || !body.relationship_type) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();

        const existing = await Relationship.findOne({
            tree_id: body.tree_id,
            person1_id: body.person1_id,
            person2_id: body.person2_id,
            relationship_type: body.relationship_type
        });

        if (existing) {
            return NextResponse.json({ message: 'Relationship already exists' }, { status: 409 });
        }

        const newRel = await Relationship.create(body);
        return NextResponse.json(newRel);
    } catch (error) {
        console.error('Create relationship error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
