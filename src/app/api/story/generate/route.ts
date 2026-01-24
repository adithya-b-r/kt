import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        await dbConnect();
        
        const user = await User.findById(decoded.userId).select('-password_hash');
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.profile_completed) {
            return NextResponse.json({ 
                error: 'Profile incomplete',
                message: 'Please complete your profile to generate your life story',
                requiresProfile: true
            }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ 
                error: 'Gemini API key not configured' 
            }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = buildStoryPrompt(user);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const story = response.text();

        await User.findByIdAndUpdate(decoded.userId, {
            generated_story: story,
            story_generated_at: new Date(),
            updated_at: new Date(),
        });

        return NextResponse.json({ 
            story,
            disclaimer: "This story is generated from information provided by your family.",
            source: "user_provided_data"
        }, { status: 200 });
    } catch (error) {
        console.error('Story generation error:', error);
        return NextResponse.json({ 
            error: 'Failed to generate story' 
        }, { status: 500 });
    }
}

function buildStoryPrompt(user: any): string {
    const fullName = `${user.first_name} ${user.last_name}`;
    
    let prompt = `You are a professional biographer. Generate a respectful, emotionally neutral life story based STRICTLY on the following factual information. 

CRITICAL RULES:
- DO NOT invent any facts
- DO NOT make assumptions
- DO NOT add speculative details
- Use only the information provided below
- Maintain a respectful, warm tone
- Write in narrative paragraphs (not bullet points)
- If information is missing, gracefully skip that section

Generate a life story for ${fullName}.

FACTUAL INFORMATION PROVIDED:

`;

    if (user.date_of_birth) {
        const birthDate = new Date(user.date_of_birth);
        prompt += `Birth Date: ${birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    }
    
    if (user.place_of_birth) {
        prompt += `Place of Birth: ${user.place_of_birth}`;
        if (user.birth_city) prompt += `, ${user.birth_city}`;
        if (user.birth_state) prompt += `, ${user.birth_state}`;
        if (user.birth_country) prompt += `, ${user.birth_country}`;
        prompt += '\n';
    }

    if (user.current_location) {
        prompt += `Current Location: ${user.current_location}\n`;
    }

    if (user.education && user.education.length > 0) {
        prompt += '\nEDUCATION:\n';
        user.education.forEach((edu: any) => {
            if (edu.degree || edu.institution) {
                prompt += `- ${edu.degree || 'Studied'} at ${edu.institution || 'an institution'}`;
                if (edu.year) prompt += ` (${edu.year})`;
                if (edu.location) prompt += ` in ${edu.location}`;
                prompt += '\n';
            }
        });
    }

    if (user.work_history && user.work_history.length > 0) {
        prompt += '\nWORK HISTORY:\n';
        user.work_history.forEach((work: any) => {
            if (work.position || work.company) {
                prompt += `- ${work.position || 'Worked'} at ${work.company || 'a company'}`;
                if (work.start_year) {
                    prompt += ` (${work.start_year}`;
                    if (work.end_year) {
                        prompt += `-${work.end_year})`;
                    } else {
                        prompt += '-Present)';
                    }
                }
                if (work.location) prompt += ` in ${work.location}`;
                prompt += '\n';
            }
        });
    }

    if (user.life_events && user.life_events.length > 0) {
        prompt += '\nLIFE EVENTS:\n';
        user.life_events.forEach((event: any) => {
            if (event.title) {
                prompt += `- ${event.year || 'Year unknown'}: ${event.title}`;
                if (event.description) prompt += ` - ${event.description}`;
                if (event.location) prompt += ` (${event.location})`;
                prompt += '\n';
            }
        });
    }

    if (user.location_history && user.location_history.length > 0) {
        prompt += '\nLOCATIONS LIVED:\n';
        user.location_history.forEach((loc: any) => {
            if (loc.location) {
                prompt += `- ${loc.year || 'Unknown year'}: ${loc.location}`;
                if (loc.city || loc.state || loc.country) {
                    prompt += ' (';
                    const parts = [];
                    if (loc.city) parts.push(loc.city);
                    if (loc.state) parts.push(loc.state);
                    if (loc.country) parts.push(loc.country);
                    prompt += parts.join(', ') + ')';
                }
                if (loc.description) prompt += ` - ${loc.description}`;
                prompt += '\n';
            }
        });
    }

    prompt += `\n\nGenerate a cohesive, readable life story in 3-5 paragraphs. Start with birth and early life, then education, career, and life milestones. Use only the facts provided above. End with a note about their current life.`;

    return prompt;
}
