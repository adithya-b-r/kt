'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    BookOpen,
    ArrowLeft,
    Loader2,
    Sparkles,
    AlertCircle,
    Download
} from 'lucide-react';
import Link from 'next/link';

export default function StoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [story, setStory] = useState<string | null>(null);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        checkProfile();
    }, [user]);

    const checkProfile = async () => {
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setProfileComplete(data.user.profile_completed || false);
                if (data.user.generated_story) {
                    setStory(data.user.generated_story);
                }
            } else if (response.status === 401) {
                toast.error('Session expired. Please log in again.');
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to check profile:', error);
        }
    };

    const generateStory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/story/generate', {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.requiresProfile) {
                    toast.error('Please complete your profile first');
                    router.push('/profile');
                    return;
                }
                throw new Error(data.error || 'Failed to generate story');
            }

            setStory(data.story);
            toast.success('Your life story has been generated!');
        } catch (error: any) {
            console.error('Failed to generate story:', error);
            toast.error(error.message || 'Failed to generate story');
        } finally {
            setLoading(false);
        }
    };

    const downloadStory = () => {
        if (!story) return;

        const element = document.createElement('a');
        const file = new Blob([story], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${user?.first_name}_life_story.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Story downloaded!');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F2E9' }}>
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#d4c5cb' }}>
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: '#64303A' }}>
                                    Your Life Story
                                </h1>
                                <p className="text-sm text-gray-600">
                                    AI-generated narrative from your profile
                                </p>
                            </div>
                        </div>
                        {story && (
                            <Button
                                onClick={downloadStory}
                                variant="outline"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {!profileComplete ? (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-800">
                                <AlertCircle className="h-5 w-5" />
                                Profile Incomplete
                            </CardTitle>
                            <CardDescription className="text-yellow-700">
                                Complete your profile to generate your life story
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-yellow-800 mb-4">
                                To generate your life story, we need some basic information about you:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-yellow-700 mb-4">
                                <li>Date of birth</li>
                                <li>Place of birth</li>
                                <li>Current location</li>
                                <li>Education, work history, and life events (optional but recommended)</li>
                            </ul>
                            <Link href="/profile">
                                <Button style={{ backgroundColor: '#64303A', color: 'white' }}>
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : !story ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" style={{ color: '#64303A' }} />
                                Generate Your Life Story
                            </CardTitle>
                            <CardDescription>
                                Create a narrative story from your profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                                        <li>Uses AI to create a readable narrative from your profile</li>
                                        <li>Based strictly on information you provided</li>
                                        <li>No invented facts or assumptions</li>
                                        <li>Respectful and emotionally neutral tone</li>
                                        <li>Can be downloaded and shared</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-amber-900 text-sm font-medium">
                                        ⚠️ Important: This story will be generated from information provided by you.
                                        AI will not add any speculative or fictional elements.
                                    </p>
                                </div>

                                <Button
                                    onClick={generateStory}
                                    disabled={loading}
                                    size="lg"
                                    className="w-full"
                                    style={{ backgroundColor: '#64303A', color: 'white' }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Generating Your Story...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            Generate My Life Story
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" style={{ color: '#64303A' }} />
                                Your Life Story
                            </CardTitle>
                            <CardDescription>
                                Generated from your profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-900 text-sm">
                                        ℹ️ This story is generated from information provided by your family.
                                    </p>
                                </div>

                                <div className="prose prose-lg max-w-none">
                                    <div
                                        className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                                        style={{ fontFamily: 'Georgia, serif' }}
                                    >
                                        {story}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={generateStory}
                                        disabled={loading}
                                        variant="outline"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Regenerating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2" />
                                                Regenerate
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={downloadStory}
                                        variant="outline"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
