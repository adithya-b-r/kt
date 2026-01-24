'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
    User, 
    Calendar, 
    MapPin, 
    GraduationCap, 
    Briefcase, 
    Heart, 
    ArrowLeft,
    Plus,
    X,
    Save,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

interface EducationEntry {
    degree: string;
    institution: string;
    year: number | '';
    location: string;
}

interface WorkEntry {
    company: string;
    position: string;
    start_year: number | '';
    end_year: number | '';
    location: string;
}

interface LifeEvent {
    year: number | '';
    event_type: 'education' | 'work' | 'travel' | 'milestone' | 'other';
    title: string;
    description: string;
    location: string;
}

interface LocationHistory {
    year: number | '';
    location: string;
    city: string;
    state: string;
    country: string;
    description: string;
}

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    const [originalData, setOriginalData] = useState<any>(null);
    
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthState, setBirthState] = useState('');
    const [birthCountry, setBirthCountry] = useState('India');
    const [currentLocation, setCurrentLocation] = useState('');
    
    const [education, setEducation] = useState<EducationEntry[]>([]);
    
    const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);
    
    const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
    
    const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                const profile = data.user;
                
                setPhone(profile.phone || '');
                setDateOfBirth(profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '');
                setPlaceOfBirth(profile.place_of_birth || '');
                setBirthCity(profile.birth_city || '');
                setBirthState(profile.birth_state || '');
                setBirthCountry(profile.birth_country || 'India');
                setCurrentLocation(profile.current_location || '');
                
                setEducation(profile.education || []);
                setWorkHistory(profile.work_history || []);
                setLifeEvents(profile.life_events || []);
                setLocationHistory(profile.location_history || []);
                
                setOriginalData({
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    phone: profile.phone || '',
                    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '',
                    place_of_birth: profile.place_of_birth || '',
                    birth_city: profile.birth_city || '',
                    birth_state: profile.birth_state || '',
                    birth_country: profile.birth_country || 'India',
                    current_location: profile.current_location || '',
                    education: JSON.stringify((profile.education || []).filter((e: any) => e.degree || e.institution)),
                    work_history: JSON.stringify((profile.work_history || []).filter((w: any) => w.company || w.position)),
                    life_events: JSON.stringify((profile.life_events || []).filter((e: any) => e.title)),
                    location_history: JSON.stringify((profile.location_history || []).filter((l: any) => l.location)),
                });
            } else if (response.status === 401) {
                toast.error('Session expired. Please log in again.');
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        if (!originalData) return true;
        
        const currentEducation = education.filter(e => e.degree || e.institution);
        const currentWorkHistory = workHistory.filter(w => w.company || w.position);
        const currentLifeEvents = lifeEvents.filter(e => e.title);
        const currentLocationHistory = locationHistory.filter(l => l.location);
        
        return (
            firstName !== originalData.first_name ||
            lastName !== originalData.last_name ||
            phone !== originalData.phone ||
            dateOfBirth !== originalData.date_of_birth ||
            placeOfBirth !== originalData.place_of_birth ||
            birthCity !== originalData.birth_city ||
            birthState !== originalData.birth_state ||
            birthCountry !== originalData.birth_country ||
            currentLocation !== originalData.current_location ||
            JSON.stringify(currentEducation) !== originalData.education ||
            JSON.stringify(currentWorkHistory) !== originalData.work_history ||
            JSON.stringify(currentLifeEvents) !== originalData.life_events ||
            JSON.stringify(currentLocationHistory) !== originalData.location_history
        );
    };

    const handleSave = async () => {
        if (!hasChanges()) {
            toast.info('No changes were made');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    date_of_birth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    place_of_birth: placeOfBirth,
                    birth_city: birthCity,
                    birth_state: birthState,
                    birth_country: birthCountry,
                    current_location: currentLocation,
                    education: education.filter(e => e.degree || e.institution),
                    work_history: workHistory.filter(w => w.company || w.position),
                    life_events: lifeEvents.filter(e => e.title),
                    location_history: locationHistory.filter(l => l.location),
                }),
            });

            if (response.ok) {
                updateUser({
                    first_name: firstName,
                    last_name: lastName,
                });
                
                toast.success('Profile updated successfully!');
                setOriginalData({
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    date_of_birth: dateOfBirth,
                    place_of_birth: placeOfBirth,
                    birth_city: birthCity,
                    birth_state: birthState,
                    birth_country: birthCountry,
                    current_location: currentLocation,
                    education: JSON.stringify(education.filter(e => e.degree || e.institution)),
                    work_history: JSON.stringify(workHistory.filter(w => w.company || w.position)),
                    life_events: JSON.stringify(lifeEvents.filter(e => e.title)),
                    location_history: JSON.stringify(locationHistory.filter(l => l.location)),
                });
            } else if (response.status === 401) {
                toast.error('Session expired. Please log in again.');
                router.push('/login');
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            toast.error('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const addEducation = () => {
        setEducation([...education, { degree: '', institution: '', year: '', location: '' }]);
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const updateEducation = (index: number, field: keyof EducationEntry, value: any) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setEducation(updated);
    };

    const addWork = () => {
        setWorkHistory([...workHistory, { company: '', position: '', start_year: '', end_year: '', location: '' }]);
    };

    const removeWork = (index: number) => {
        setWorkHistory(workHistory.filter((_, i) => i !== index));
    };

    const updateWork = (index: number, field: keyof WorkEntry, value: any) => {
        const updated = [...workHistory];
        updated[index] = { ...updated[index], [field]: value };
        setWorkHistory(updated);
    };

    const addLifeEvent = () => {
        setLifeEvents([...lifeEvents, { year: '', event_type: 'milestone', title: '', description: '', location: '' }]);
    };

    const removeLifeEvent = (index: number) => {
        setLifeEvents(lifeEvents.filter((_, i) => i !== index));
    };

    const updateLifeEvent = (index: number, field: keyof LifeEvent, value: any) => {
        const updated = [...lifeEvents];
        updated[index] = { ...updated[index], [field]: value };
        setLifeEvents(updated);
    };

    const addLocation = () => {
        setLocationHistory([...locationHistory, { year: '', location: '', city: '', state: '', country: 'India', description: '' }]);
    };

    const removeLocation = (index: number) => {
        setLocationHistory(locationHistory.filter((_, i) => i !== index));
    };

    const updateLocation = (index: number, field: keyof LocationHistory, value: any) => {
        const updated = [...locationHistory];
        updated[index] = { ...updated[index], [field]: value };
        setLocationHistory(updated);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2E9' }}>
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#64303A' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F2E9]">
            <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: '#d4c5cb' }}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: '#64303A' }}>Your Profile</h1>
                                <p className="text-sm text-gray-600">Complete your profile to unlock AI stories & timelines</p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            style={{ backgroundColor: '#64303A', color: 'white' }}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <User className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>Your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName" className="font-semibold">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 9876543210"
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <Calendar className="h-5 w-5" />
                            Birth Information
                        </CardTitle>
                        <CardDescription>Required for AI story generation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="dateOfBirth" className="font-semibold">Date of Birth *</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="placeOfBirth" className="font-semibold">Place of Birth *</Label>
                            <Input
                                id="placeOfBirth"
                                value={placeOfBirth}
                                onChange={(e) => setPlaceOfBirth(e.target.value)}
                                placeholder="Hospital name or area"
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="birthCity" className="font-semibold">City</Label>
                                <Input
                                    id="birthCity"
                                    value={birthCity}
                                    onChange={(e) => setBirthCity(e.target.value)}
                                    placeholder="Mumbai"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="birthState" className="font-semibold">State</Label>
                                <Input
                                    id="birthState"
                                    value={birthState}
                                    onChange={(e) => setBirthState(e.target.value)}
                                    placeholder="Maharashtra"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="birthCountry" className="font-semibold">Country</Label>
                                <Input
                                    id="birthCountry"
                                    value={birthCountry}
                                    onChange={(e) => setBirthCountry(e.target.value)}
                                    placeholder="India"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <MapPin className="h-5 w-5" />
                            Current Location
                        </CardTitle>
                        <CardDescription>Where you live now *</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="currentLocation" className="font-semibold">Current Location *</Label>
                        <Input
                            id="currentLocation"
                            value={currentLocation}
                            onChange={(e) => setCurrentLocation(e.target.value)}
                            placeholder="City, State, Country"
                            className="mt-1"
                        />
                    </CardContent>
                </Card>

                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <GraduationCap className="h-5 w-5" />
                            Education
                        </CardTitle>
                        <CardDescription>Your educational background</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {education.map((edu, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeEducation(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="font-semibold">Degree</Label>
                                        <Input
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            placeholder="B.Tech in Computer Science"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Institution</Label>
                                        <Input
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                            placeholder="IIT Mumbai"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Year</Label>
                                        <Input
                                            type="number"
                                            value={edu.year}
                                            onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value) || '')}
                                            placeholder="2020"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Location</Label>
                                        <Input
                                            value={edu.location}
                                            onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                            placeholder="Mumbai, India"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addEducation} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                        </Button>
                    </CardContent>
                </Card>

                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <Briefcase className="h-5 w-5" />
                            Work History
                        </CardTitle>
                        <CardDescription>Your professional experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {workHistory.map((work, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeWork(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="font-semibold">Company</Label>
                                        <Input
                                            value={work.company}
                                            onChange={(e) => updateWork(index, 'company', e.target.value)}
                                            placeholder="Tech Corp"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Position</Label>
                                        <Input
                                            value={work.position}
                                            onChange={(e) => updateWork(index, 'position', e.target.value)}
                                            placeholder="Software Engineer"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Start Year</Label>
                                        <Input
                                            type="number"
                                            value={work.start_year}
                                            onChange={(e) => updateWork(index, 'start_year', parseInt(e.target.value) || '')}
                                            placeholder="2020"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">End Year</Label>
                                        <Input
                                            type="number"
                                            value={work.end_year}
                                            onChange={(e) => updateWork(index, 'end_year', parseInt(e.target.value) || '')}
                                            placeholder="2024 or leave blank if current"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="font-semibold">Location</Label>
                                        <Input
                                            value={work.location}
                                            onChange={(e) => updateWork(index, 'location', e.target.value)}
                                            placeholder="Bangalore, India"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addWork} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Work Experience
                        </Button>
                    </CardContent>
                </Card>

                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <Heart className="h-5 w-5" />
                            Life Events
                        </CardTitle>
                        <CardDescription>Major milestones in your life</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lifeEvents.map((event, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeLifeEvent(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="font-semibold">Year</Label>
                                        <Input
                                            type="number"
                                            value={event.year}
                                            onChange={(e) => updateLifeEvent(index, 'year', parseInt(e.target.value) || '')}
                                            placeholder="2015"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Event Type</Label>
                                        <Select
                                            value={event.event_type}
                                            onValueChange={(value) => updateLifeEvent(index, 'event_type', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="education">Education</SelectItem>
                                                <SelectItem value="work">Work</SelectItem>
                                                <SelectItem value="travel">Travel</SelectItem>
                                                <SelectItem value="milestone">Milestone</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="font-semibold">Title</Label>
                                        <Input
                                            value={event.title}
                                            onChange={(e) => updateLifeEvent(index, 'title', e.target.value)}
                                            placeholder="Graduated from College"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="font-semibold">Description</Label>
                                        <Input
                                            value={event.description}
                                            onChange={(e) => updateLifeEvent(index, 'description', e.target.value)}
                                            placeholder="Brief description of the event"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="font-semibold">Location</Label>
                                        <Input
                                            value={event.location}
                                            onChange={(e) => updateLifeEvent(index, 'location', e.target.value)}
                                            placeholder="City, Country"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addLifeEvent} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Life Event
                        </Button>
                    </CardContent>
                </Card>

                <Card className="mb-6 border-2" style={{ borderColor: '#d4c5cb' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#64303A' }}>
                            <MapPin className="h-5 w-5" />
                            Location History
                        </CardTitle>
                        <CardDescription>Places you&apos;ve lived or traveled to</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {locationHistory.map((loc, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => removeLocation(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <Label className="font-semibold">Year</Label>
                                        <Input
                                            type="number"
                                            value={loc.year}
                                            onChange={(e) => updateLocation(index, 'year', parseInt(e.target.value) || '')}
                                            placeholder="2015"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Location Name</Label>
                                        <Input
                                            value={loc.location}
                                            onChange={(e) => updateLocation(index, 'location', e.target.value)}
                                            placeholder="My hometown"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">City</Label>
                                        <Input
                                            value={loc.city}
                                            onChange={(e) => updateLocation(index, 'city', e.target.value)}
                                            placeholder="Mumbai"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">State</Label>
                                        <Input
                                            value={loc.state}
                                            onChange={(e) => updateLocation(index, 'state', e.target.value)}
                                            placeholder="Maharashtra"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold">Country</Label>
                                        <Input
                                            value={loc.country}
                                            onChange={(e) => updateLocation(index, 'country', e.target.value)}
                                            placeholder="India"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="font-semibold">Description</Label>
                                        <Input
                                            value={loc.description}
                                            onChange={(e) => updateLocation(index, 'description', e.target.value)}
                                            placeholder="Why this location is significant"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addLocation} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Location
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        size="lg"
                        style={{ backgroundColor: '#64303A', color: 'white' }}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
