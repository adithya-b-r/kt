import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Relationship from '@/models/Relationship';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        await connectToDatabase();

        const updatedRel = await Relationship.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true } // Return updated document
        );

        if (!updatedRel) {
            return NextResponse.json({ message: 'Relationship not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRel);
    } catch (error) {
        console.error('Update relationship error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectToDatabase();
        await Relationship.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Relationship deleted' });
    } catch (error) {
         console.error('Delete relationship error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
