import mongoose, { Schema, Model } from 'mongoose';

export interface IRelationship {
    _id: mongoose.Types.ObjectId;
    tree_id: mongoose.Types.ObjectId;
    person1_id: mongoose.Types.ObjectId;
    person2_id: mongoose.Types.ObjectId;
    relationship_type: string;
    created_at: Date;
}

const RelationshipSchema = new Schema<IRelationship>({
    tree_id: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true },
    person1_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    person2_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    relationship_type: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

const Relationship: Model<IRelationship> = mongoose.models.Relationship || mongoose.model<IRelationship>('Relationship', RelationshipSchema);

export default Relationship;
