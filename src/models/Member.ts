import mongoose, { Schema, Model } from 'mongoose';

export interface IMember {
    _id: mongoose.Types.ObjectId;
    tree_id: mongoose.Types.ObjectId;
    first_name: string;
    last_name: string;
    gender?: string;
    birth_date?: Date;
    death_date?: Date;
    photo_url?: string;
    is_root?: boolean;
    attributes?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

const MemberSchema = new Schema<IMember>({
    tree_id: { type: Schema.Types.ObjectId, ref: 'FamilyTree', required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String },
    birth_date: { type: Date },
    death_date: { type: Date },
    photo_url: { type: String },
    is_root: { type: Boolean, default: false },
    attributes: { type: Map, of: Schema.Types.Mixed },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
