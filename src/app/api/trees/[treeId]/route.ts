import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FamilyTree from '@/models/FamilyTree';
import Member from '@/models/Member';
import Relationship from '@/models/Relationship';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ treeId: string }> }
) {
    try {
        const { treeId } = await params;
        if (!treeId) {
            return NextResponse.json({ message: 'Tree ID required' }, { status: 400 });
        }

        await connectToDatabase();

        const tree = await FamilyTree.findById(treeId);
        if (!tree) {
            return NextResponse.json({ message: 'Family tree not found' }, { status: 404 });
        }

        const members = await Member.find({ tree_id: treeId });

        const relationships = await Relationship.find({ tree_id: treeId });

        return NextResponse.json({
            tree,
            members,
            relationships,
        });
    } catch (error) {
        console.error('Fetch tree error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
