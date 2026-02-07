import mongoose, { Schema, Model } from 'mongoose';

export interface IRelationship {
    _id: mongoose.Types.ObjectId;
    tree_id: mongoose.Types.ObjectId;
    person1_id: mongoose.Types.ObjectId;
    person2_id: mongoose.Types.ObjectId;
    relationship_type: string;
    marriage_date?: Date;
    divorce_date?: Date;
    nature: 'biological' | 'adopted';
    created_at: Date;
}

const RelationshipSchema = new Schema<IRelationship>({
    tree_id: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true },
    person1_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    person2_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    relationship_type: { type: String, required: true },
    marriage_date: { type: Date },
    divorce_date: { type: Date },
    nature: { type: String, enum: ['biological', 'adopted'], default: 'biological' },
    created_at: { type: Date, default: Date.now },
});

const Relationship: Model<IRelationship> = mongoose.models.Relationship || mongoose.model<IRelationship>('Relationship', RelationshipSchema);

export default Relationship;
