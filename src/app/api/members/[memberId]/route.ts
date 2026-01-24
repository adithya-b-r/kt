import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Member from '@/models/Member';
import Relationship from '@/models/Relationship';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const { memberId } = await params;
        const body = await request.json();

        await connectToDatabase();
        const updatedMember = await Member.findByIdAndUpdate(memberId, body, { new: true });

        if (!updatedMember) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error('Update member error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ memberId: string }> }
) {
    try {
        const { memberId } = await params;
        await connectToDatabase();

        await Member.findByIdAndDelete(memberId);

        await Relationship.deleteMany({
            $or: [{ person1_id: memberId }, { person2_id: memberId }]
        });

        return NextResponse.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Delete member error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
