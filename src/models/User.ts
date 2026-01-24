import mongoose, { Schema, Model } from 'mongoose';

export interface ILifeEvent {
    year: number;
    event_type: 'education' | 'work' | 'travel' | 'milestone' | 'other';
    title: string;
    description?: string;
    location?: string;
}

export interface ILocationHistory {
    year: number;
    location: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
}

export interface IUser {
    _id: mongoose.Types.ObjectId;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    phone?: string;
    
    date_of_birth?: Date;
    place_of_birth?: string;
    birth_city?: string;
    birth_state?: string;
    birth_country?: string;
    current_location?: string;
    
    education?: Array<{
        degree?: string;
        institution?: string;
        year?: number;
        location?: string;
    }>;
    

    work_history?: Array<{
        company?: string;
        position?: string;
        start_year?: number;
        end_year?: number;
        location?: string;
    }>;
    

    life_events?: ILifeEvent[];
    
    location_history?: ILocationHistory[];
    
    profile_completed?: boolean;

    generated_story?: string;
    story_generated_at?: Date;
    
    created_at: Date;
    updated_at: Date;
}

const LocationHistorySchema = new Schema({
    year: { type: Number, required: true },
    location: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    description: { type: String },
}, { _id: false });

const LifeEventSchema = new Schema({
    year: { type: Number, required: true },
    event_type: { type: String, enum: ['education', 'work', 'travel', 'milestone', 'other'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
}, { _id: false });

const UserSchema = new Schema<IUser>({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    phone: { type: String },
    
    date_of_birth: { type: Date },
    place_of_birth: { type: String },
    birth_city: { type: String },
    birth_state: { type: String },
    birth_country: { type: String },
    current_location: { type: String },
    
    education: [{
        degree: { type: String },
        institution: { type: String },
        year: { type: Number },
        location: { type: String },
    }],
    
    work_history: [{
        company: { type: String },
        position: { type: String },
        start_year: { type: Number },
        end_year: { type: Number },
        location: { type: String },
    }],
    
    life_events: [LifeEventSchema],
    location_history: [LocationHistorySchema],
    
    profile_completed: { type: Boolean, default: false },

    generated_story: { type: String },
    story_generated_at: { type: Date },
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
