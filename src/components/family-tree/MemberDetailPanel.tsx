import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Trash2, Calendar, Heart, ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FamilyMember } from '@/components/hooks/useFamilyTree';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface MemberDetailPanelProps {
    member: FamilyMember | null;
    parents?: FamilyMember[];
    spouse?: FamilyMember | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<FamilyMember>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onAddRelationship: () => void;
}

export const MemberDetailPanel: React.FC<MemberDetailPanelProps> = ({
    member,
    parents = [],
    spouse = null,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
    onAddRelationship,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<FamilyMember>>({});

    useEffect(() => {
        if (member) {
            setEditData({
                first_name: member.first_name,
                last_name: member.last_name,
                gender: member.gender || '',
                birth_date: member.birth_date || '',
                death_date: member.death_date || '',
            });
            setIsEditing(false);
        }
    }, [member]);

    const genderConflict =
        isEditing &&
        !!editData.gender &&
        !!spouse?.gender &&
        editData.gender === spouse.gender;

    const handleSave = async () => {
        if (!member) return;
        if (genderConflict) {
            toast.error('Parents cannot have the same gender');
            return;
        }
        try {
            await onUpdate(member.id, editData);
            setIsEditing(false);
            toast.success('Member updated successfully');
        } catch (error) {
            toast.error('Failed to update member');
        }
    };

    const handleDelete = async () => {
        if (!member) return;
        if (window.confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
            try {
                await onDelete(member.id);
                onClose();
                toast.success('Member deleted');
            } catch (error) {
                toast.error('Failed to delete member');
            }
        }
    };

    if (!member) return null;

    const birthYear = member.birth_date ? new Date(member.birth_date).getFullYear() : null;
    const deathYear = member.death_date ? new Date(member.death_date).getFullYear() : null;
    const isDeceased = !!member.death_date;

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-40 transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                style={{ backgroundColor: 'rgba(100, 48, 58, 0.3)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            <div
                className={cn(
                    "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transition-transform duration-300 overflow-y-auto",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                style={{ borderLeft: '2px solid #d4c5cb' }}
            >
                <div className="sticky top-0 bg-white p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #d4c5cb' }}>
                    <h2 className="font-semibold text-lg" style={{ color: '#64303A' }}>Member Details</h2>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#64303A' }}
                                    disabled={genderConflict}
                                >
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {!isEditing && (
                        <div className="text-center">
                            <div className={cn(
                                "w-24 h-24 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-4",
                                member.gender === 'male' || member.gender === 'Male' ? "bg-blue-100 text-blue-600" :
                                    member.gender === 'female' || member.gender === 'Female' ? "bg-pink-100 text-pink-600" :
                                        "bg-muted text-muted-foreground"
                            )}>
                                {member.photo_url ? (
                                    <img
                                        src={member.photo_url}
                                        alt={`${member.first_name} ${member.last_name}`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span>{member.first_name[0]}{member.last_name[0]}</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: '#64303A' }}>
                                {member.first_name} {member.last_name}
                            </h3>
                            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                                {member.is_root && (
                                    <Badge variant="default">
                                        <Heart className="h-3 w-3 mr-1" />
                                        Root Person
                                    </Badge>
                                )}
                                <Badge variant="outline" className={isDeceased ? "border-muted-foreground text-muted-foreground" : "border-green-500 text-green-600"}>
                                    {isDeceased ? "Deceased" : "Living"}
                                </Badge>
                                {member.gender && (
                                    <Badge variant="secondary">
                                        {member.gender}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>First Name *</Label>
                                    <Input
                                        value={editData.first_name || ''}
                                        onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                                        className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                                        maxLength={50}
                                    />
                                </div>
                                <div>
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={editData.last_name || ''}
                                        onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                                        className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Gender</Label>
                                <Select
                                    value={editData.gender || ''}
                                    onValueChange={(value) => setEditData(prev => ({ ...prev, gender: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {genderConflict && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm font-medium text-amber-800">Gender Conflict</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        {spouse?.first_name} {spouse?.last_name} already has gender set to {spouse?.gender}. Parents cannot have the same gender.
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={editData.birth_date || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, birth_date: e.target.value }))}
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                                />
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-gray-600">Deceased?</Label>
                                <p className="text-xs text-gray-600 mb-2">Leave empty if person is alive</p>
                                <Input
                                    type="date"
                                    value={editData.death_date || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, death_date: e.target.value }))}
                                    placeholder="Death date (if applicable)"
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                                />
                            </div>

                            <Separator />

                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-between text-gray-600">
                                        <span className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Cultural & Life Details
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#f5e6e9', color: '#64303A' }}>Coming Soon</Badge>
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="p-4 rounded-lg mt-2 space-y-3" style={{ backgroundColor: '#f5e6e9' }}>
                                        <p className="text-sm text-gray-600">
                                            The following fields will be available in the Heritage Explorer plan:
                                        </p>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                            <li>Birth & Death Places</li>
                                            <li>Religion & Caste</li>
                                            <li>Mother Tongue & Languages</li>
                                            <li>Education & Qualifications</li>
                                            <li>Occupation & Employment History</li>
                                            <li>Life Events & Milestones</li>
                                            <li>Cultural Ceremonies (Thread, Baptism, etc.)</li>
                                            <li>Biography & Notes</li>
                                            <li>Places Lived</li>
                                        </ul>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {parents.length > 0 && (
                                    <div>
                                        <p className="text-sm font-semibold mb-2" style={{ color: '#64303A' }}>Parents</p>
                                        <div className="space-y-2">
                                            {parents.map((parent) => (
                                                <div
                                                    key={parent.id}
                                                    className="flex items-center justify-between rounded-lg border p-2"
                                                    style={{ borderColor: '#d4c5cb', backgroundColor: '#fdfaf6' }}
                                                >
                                                    <span className="text-sm text-gray-700">
                                                        {parent.first_name} {parent.last_name}
                                                    </span>
                                                    {parent.gender && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {parent.gender}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {birthYear && (
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium" style={{ color: '#64303A' }}>Born</p>
                                            <p className="text-sm text-gray-600">
                                                {member.birth_date ? new Date(member.birth_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isDeceased && deathYear && (
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium" style={{ color: '#64303A' }}>Died</p>
                                            <p className="text-sm text-gray-600">
                                                {member.death_date ? new Date(member.death_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-between text-gray-600">
                                        <span className="flex items-center gap-2">
                                            <Lock className="h-4 w-4" />
                                            Cultural & Life Details
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#f5e6e9', color: '#64303A' }}>Coming Soon</Badge>
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="p-4 rounded-lg mt-2" style={{ backgroundColor: '#f5e6e9' }}>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Unlock detailed cultural and life information with Heritage Explorer:
                                        </p>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                            <li>Religion, Caste & Gotra</li>
                                            <li>Languages & Mother Tongue</li>
                                            <li>Education & Career History</li>
                                            <li>Life Events Timeline</li>
                                            <li>Cultural Ceremonies</li>
                                            <li>Detailed Biography</li>
                                        </ul>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <Separator />

                            <div className="space-y-3">
                                <Button className="w-full text-white" style={{ backgroundColor: '#64303A' }} onClick={onAddRelationship}>
                                    <Heart className="h-4 w-4 mr-2" />
                                    Add Relationship
                                </Button>

                                {!member.is_root && (
                                    <Button variant="destructive" className="w-full text-white bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Member
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
