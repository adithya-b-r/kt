'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

import { LocationSelector } from '@/components/LocationSelector';

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
    const [middleName, setMiddleName] = useState('');
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

    // ... existing state ...
    const [workHistory, setWorkHistory] = useState<WorkEntry[]>([]);
    const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
    const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        setFirstName(user.first_name || '');
        setMiddleName(user.middle_name || '');
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
                    middle_name: user?.middle_name || '',
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

    // ... existing methods ...

    // Helper for Birth Info location change
    const handleBirthLocationChange = (field: 'country' | 'state' | 'city', value: string) => {
        if (field === 'country') setBirthCountry(value);
        if (field === 'state') setBirthState(value);
        if (field === 'city') setBirthCity(value);
    };

    const hasChanges = () => {
        // ... implementation ...
        if (!originalData) return true;

        const currentEducation = education.filter(e => e.degree || e.institution);
        const currentWorkHistory = workHistory.filter(w => w.company || w.position);
        const currentLifeEvents = lifeEvents.filter(e => e.title);
        const currentLocationHistory = locationHistory.filter(l => l.location);

        return (
            firstName !== originalData.first_name ||
            middleName !== originalData.middle_name ||
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
                    middle_name: middleName,
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
                    middle_name: middleName,
                    last_name: lastName,
                });

                toast.success('Profile updated successfully!');
                setOriginalData({
                    first_name: firstName,
                    middle_name: middleName,
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

    // New handler for location selection in history
    const updateLocationHistoryItem = (index: number, field: 'country' | 'state' | 'city', value: string) => {
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
        <div className="min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-kutumba-maroon)] selection:text-white pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-[var(--color-kutumba-border)] sticky top-0 z-40 transition-all duration-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between max-w-5xl mx-auto">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="hover:bg-[var(--color-kutumba-light-teal)] hover:text-[var(--color-kutumba-teal)] transition-colors">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-[var(--color-kutumba-maroon)]">Your Profile</h1>
                                <p className="text-sm text-[var(--color-kutumba-muted)] hidden sm:block">Manage your personal story and timeline</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[var(--color-kutumba-maroon)] hover:bg-[var(--color-kutumba-maroon)]/90 text-white shadow-md hover:shadow-lg transition-all rounded-full px-6"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
                <div className="grid grid-cols-1 gap-8">
                    {/* Basic Information */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-maroon)] to-[var(--color-kutumba-gold)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-maroon)]">
                                <div className="p-2 bg-[var(--color-kutumba-light-teal)] rounded-full text-[var(--color-kutumba-teal)]">
                                    <User className="h-5 w-5" />
                                </div>
                                Basic Information
                            </CardTitle>
                            <CardDescription>Your personal details displayed on your family tree</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="font-medium text-gray-700">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="h-11 border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middleName" className="font-medium text-gray-700">Middle Name</Label>
                                    <Input
                                        id="middleName"
                                        value={middleName}
                                        onChange={(e) => setMiddleName(e.target.value)}
                                        className="h-11 border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="font-medium text-gray-700">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="h-11 border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] transition-all bg-gray-50/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="font-medium text-gray-700">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                    className="h-11 border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] transition-all bg-gray-50/50 max-w-md"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Birth Information */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-green)] to-[var(--color-kutumba-teal)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-green)]">
                                <div className="p-2 bg-[var(--color-kutumba-light-teal)] rounded-full text-[var(--color-kutumba-green)]">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                Birth Information
                            </CardTitle>
                            <CardDescription>Help us create your AI life story</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth" className="font-medium text-gray-700">Date of Birth *</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="h-11 border-gray-200 focus:border-[var(--color-kutumba-green)] focus:ring-[var(--color-kutumba-green)] transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="placeOfBirth" className="font-medium text-gray-700">Place of Birth *</Label>
                                    <Input
                                        id="placeOfBirth"
                                        value={placeOfBirth}
                                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                                        placeholder="Hospital name or area"
                                        className="h-11 border-gray-200 focus:border-[var(--color-kutumba-green)] focus:ring-[var(--color-kutumba-green)] transition-all bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <LocationSelector
                                country={birthCountry}
                                state={birthState}
                                city={birthCity}
                                onLocationChange={handleBirthLocationChange}
                                labels={{ country: 'Country', state: 'State', city: 'City' }}
                            />
                        </CardContent>
                    </Card>

                    {/* Current Location */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-teal)] to-[var(--color-kutumba-maroon)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-teal)]">
                                <div className="p-2 bg-[var(--color-kutumba-light-teal)] rounded-full text-[var(--color-kutumba-teal)]">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                Current Location
                            </CardTitle>
                            <CardDescription>Where you live now *</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            <div className="space-y-2">
                                <Label htmlFor="currentLocation" className="font-medium text-gray-700">Current Location *</Label>
                                <Input
                                    id="currentLocation"
                                    value={currentLocation}
                                    onChange={(e) => setCurrentLocation(e.target.value)}
                                    placeholder="City, State, Country"
                                    className="h-11 border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] transition-all bg-gray-50/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-gold)] to-[var(--color-kutumba-maroon)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-gold)]">
                                <div className="p-2 bg-yellow-50 rounded-full text-[var(--color-kutumba-gold)]">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                Education
                            </CardTitle>
                            <CardDescription>Your educational background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            {education.map((edu, index) => (
                                <div key={index} className="p-6 border border-gray-100 rounded-xl space-y-4 relative bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => removeEducation(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Degree</Label>
                                            <Input
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                placeholder="B.Tech in Computer Science"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Institution</Label>
                                            <Input
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                placeholder="IIT Mumbai"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Year</Label>
                                            <Input
                                                type="number"
                                                value={edu.year}
                                                onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value) || '')}
                                                placeholder="2020"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Location</Label>
                                            <Input
                                                value={edu.location}
                                                onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                                placeholder="Mumbai, India"
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addEducation} className="w-full border-dashed border-2 py-6 hover:border-[var(--color-kutumba-gold)] hover:text-[var(--color-kutumba-gold)] hover:bg-yellow-50/50 transition-all text-gray-500">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Education
                            </Button>
                        </CardContent>
                    </Card>
                    {/* Work History */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-maroon)] to-[var(--color-kutumba-teal)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-maroon)]">
                                <div className="p-2 bg-red-50 rounded-full text-[var(--color-kutumba-maroon)]">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                Work History
                            </CardTitle>
                            <CardDescription>Your professional experience</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            {workHistory.map((work, index) => (
                                <div key={index} className="p-6 border border-gray-100 rounded-xl space-y-4 relative bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => removeWork(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Company</Label>
                                            <Input
                                                value={work.company}
                                                onChange={(e) => updateWork(index, 'company', e.target.value)}
                                                placeholder="Tech Corp"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Position</Label>
                                            <Input
                                                value={work.position}
                                                onChange={(e) => updateWork(index, 'position', e.target.value)}
                                                placeholder="Software Engineer"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Start Year</Label>
                                            <Input
                                                type="number"
                                                value={work.start_year}
                                                onChange={(e) => updateWork(index, 'start_year', parseInt(e.target.value) || '')}
                                                placeholder="2020"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">End Year</Label>
                                            <Input
                                                type="number"
                                                value={work.end_year}
                                                onChange={(e) => updateWork(index, 'end_year', parseInt(e.target.value) || '')}
                                                placeholder="2024 or leave blank if current"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="font-medium text-gray-700">Location</Label>
                                            <Input
                                                value={work.location}
                                                onChange={(e) => updateWork(index, 'location', e.target.value)}
                                                placeholder="Bangalore, India"
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addWork} className="w-full border-dashed border-2 py-6 hover:border-[var(--color-kutumba-maroon)] hover:text-[var(--color-kutumba-maroon)] hover:bg-red-50/50 transition-all text-gray-500">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Work Experience
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Life Events */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-maroon)] to-[var(--color-kutumba-gold)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-maroon)]">
                                <div className="p-2 bg-pink-50 rounded-full text-[var(--color-kutumba-maroon)]">
                                    <Heart className="h-5 w-5" />
                                </div>
                                Life Events
                            </CardTitle>
                            <CardDescription>Major milestones in your life</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            {lifeEvents.map((event, index) => (
                                <div key={index} className="p-6 border border-gray-100 rounded-xl space-y-4 relative bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => removeLifeEvent(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Year</Label>
                                            <Input
                                                type="number"
                                                value={event.year}
                                                onChange={(e) => updateLifeEvent(index, 'year', parseInt(e.target.value) || '')}
                                                placeholder="2015"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Event Type</Label>
                                            <Select
                                                value={event.event_type}
                                                onValueChange={(value) => updateLifeEvent(index, 'event_type', value)}
                                            >
                                                <SelectTrigger className="bg-white">
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
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="font-medium text-gray-700">Title</Label>
                                            <Input
                                                value={event.title}
                                                onChange={(e) => updateLifeEvent(index, 'title', e.target.value)}
                                                placeholder="Graduated from College"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="font-medium text-gray-700">Description</Label>
                                            <Input
                                                value={event.description}
                                                onChange={(e) => updateLifeEvent(index, 'description', e.target.value)}
                                                placeholder="Brief description of the event"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="font-medium text-gray-700">Location</Label>
                                            <Input
                                                value={event.location}
                                                onChange={(e) => updateLifeEvent(index, 'location', e.target.value)}
                                                placeholder="City, Country"
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addLifeEvent} className="w-full border-dashed border-2 py-6 hover:border-[var(--color-kutumba-maroon)] hover:text-[var(--color-kutumba-maroon)] hover:bg-pink-50/50 transition-all text-gray-500">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Life Event
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Location History */}
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-[var(--color-kutumba-teal)] to-[var(--color-kutumba-green)]" />
                        <CardHeader className="pb-4 border-b border-gray-100 bg-white">
                            <CardTitle className="flex items-center gap-3 text-xl text-[var(--color-kutumba-teal)]">
                                <div className="p-2 bg-teal-50 rounded-full text-[var(--color-kutumba-teal)]">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                Location History
                            </CardTitle>
                            <CardDescription>Places you&apos;ve lived or traveled to</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            {locationHistory.map((loc, index) => (
                                <div key={index} className="p-6 border border-gray-100 rounded-xl space-y-4 relative bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => removeLocation(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Year</Label>
                                            <Input
                                                type="number"
                                                value={loc.year}
                                                onChange={(e) => updateLocation(index, 'year', parseInt(e.target.value) || '')}
                                                placeholder="2015"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-medium text-gray-700">Location Name</Label>
                                            <Input
                                                value={loc.location}
                                                onChange={(e) => updateLocation(index, 'location', e.target.value)}
                                                placeholder="My hometown"
                                                className="bg-white"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <LocationSelector
                                                country={loc.country}
                                                state={loc.state}
                                                city={loc.city}
                                                onLocationChange={(field, value) => updateLocationHistoryItem(index, field, value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="font-medium text-gray-700">Description</Label>
                                            <Input
                                                value={loc.description}
                                                onChange={(e) => updateLocation(index, 'description', e.target.value)}
                                                placeholder="Why this location is significant"
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" onClick={addLocation} className="w-full border-dashed border-2 py-6 hover:border-[var(--color-kutumba-teal)] hover:text-[var(--color-kutumba-teal)] hover:bg-teal-50/50 transition-all text-gray-500">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Location
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-6">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="lg"
                        className="bg-[var(--color-kutumba-maroon)] hover:bg-[var(--color-kutumba-maroon)]/90 text-white shadow-lg hover:shadow-xl transition-all rounded-full px-8 text-lg"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Save All Changes
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div >
    );
}
