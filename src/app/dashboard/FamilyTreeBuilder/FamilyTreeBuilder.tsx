'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
    Plus,
    Users,
    Share2,
    Download,
    ArrowLeft,
    Lock,
    ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useFamilyTree, FamilyMember } from './hooks/useFamilyTree';
import { TreeVisualization } from './components/TreeVisualization';
import { MemberDetailPanel } from './components/MemberDetailPanel';
import { AddRelationshipDialog } from './components/AddRelationshipDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { toast } from './ui/sonner';

const FamilyTreeBuilder = ({ treeId }: { treeId: string }) => {
    const {
        familyTree,
        familyMembers,
        relationships,
        loading,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        addRelationship,
    } = useFamilyTree(treeId);

    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isAddingRelationship, setIsAddingRelationship] = useState(false);

    // For contextual add (parent/spouse/child)
    const [addContext, setAddContext] = useState<{
        relationType?: 'parent' | 'spouse' | 'child';
        relatedTo?: FamilyMember;
    }>({});

    // MVP: Only essential fields
    const [newMemberData, setNewMemberData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        birth_date: '',
        death_date: '',
    });

    const handleSelectMember = (member: FamilyMember) => {
        setSelectedMember(member);
        setIsDetailPanelOpen(true);
    };

    const handleAddMember = async () => {
        if (!newMemberData.first_name || !newMemberData.last_name) {
            toast.error('First name and last name are required');
            return;
        }

        // Check free limit
        if (familyMembers.length >= 25) {
            toast.error('Free plan limit reached (25 members). Premium coming soon!');
            return;
        }

        try {
            const newMember = await addFamilyMember(newMemberData);

            // If adding with context (parent/spouse/child), create the relationship
            if (addContext.relationType && addContext.relatedTo && newMember) {
                let person1_id: string, person2_id: string, relationship_type: string;

                switch (addContext.relationType) {
                    case 'parent':
                        person1_id = newMember.id;
                        person2_id = addContext.relatedTo.id;
                        relationship_type = 'parent_child';
                        break;
                    case 'child':
                        person1_id = addContext.relatedTo.id;
                        person2_id = newMember.id;
                        relationship_type = 'parent_child';

                        // Check if the parent (relatedTo) has a spouse
                        const spouseRel = relationships.find(r =>
                            r.relationship_type === 'spouse' &&
                            (r.person1_id === addContext.relatedTo!.id || r.person2_id === addContext.relatedTo!.id)
                        );

                        if (spouseRel) {
                            const spouseId = spouseRel.person1_id === addContext.relatedTo.id ? spouseRel.person2_id : spouseRel.person1_id;
                            // Add relationship with spouse too
                            // We do this immediately after the first one
                            setTimeout(() => {
                                addRelationship({
                                    person1_id: spouseId,
                                    person2_id: newMember.id,
                                    relationship_type: 'parent_child'
                                });
                            }, 100);
                        }
                        break;
                    case 'spouse':
                        person1_id = addContext.relatedTo.id;
                        person2_id = newMember.id;
                        relationship_type = 'spouse';
                        break;
                    default:
                        person1_id = '';
                        person2_id = '';
                        relationship_type = '';
                }

                if (person1_id && person2_id) {
                    await addRelationship({ person1_id, person2_id, relationship_type });
                }
            }

            setIsAddingMember(false);
            setAddContext({});
            setNewMemberData({
                first_name: '',
                last_name: '',
                gender: '',
                birth_date: '',
                death_date: '',
            });
            toast.success('Family member added successfully!');
        } catch (error) {
            console.error('Failed to add family member:', error);
            toast.error('Failed to add family member');
        }
    };

    const handleOpenAddMember = (relationType?: 'parent' | 'spouse' | 'child' | null, relatedTo?: FamilyMember | null) => {
        setAddContext({ relationType: relationType || undefined, relatedTo: relatedTo || undefined });

        // Pre-fill last name from the related person if adding child or sibling (assuming same family name)
        // For spouse, we usually don't assume, but could.
        let initialLastName = '';
        if (relatedTo && (relationType === 'child' || relationType === 'spouse')) {
            // Note: Spouse might keep maiden name, but often shares name. Child definitely does usually.
            // Let's just do it for Child for now as that's the explicit request "Add Child of John Doe".
            if (relationType === 'child') {
                initialLastName = relatedTo.last_name;
            }
        }

        setNewMemberData(prev => ({ ...prev, last_name: initialLastName }));
        setIsAddingMember(true);
    };

    const handleExport = () => {
        toast.info('Export feature coming soon in Heritage Explorer!');
    };

    const handleShare = () => {
        toast.info('Sharing feature coming soon in Heritage Explorer!');
    };

    const handleAddRelationship = async (relationshipData: {
        person1_id: string;
        person2_id: string;
        relationship_type: string;
        start_date?: string;
        end_date?: string;
        is_primary?: boolean;
        notes?: string;
    }): Promise<void> => {
        await addRelationship(relationshipData);
    };

    const handleUpdateMember = async (id: string, data: Partial<FamilyMember>) => {
        await updateFamilyMember(id, data);
        if (selectedMember?.id === id) {
            setSelectedMember(prev => prev ? { ...prev, ...data } : null);
        }
    };

    const handleDeleteMember = async (id: string) => {
        await deleteFamilyMember(id);
        setSelectedMember(null);
        setIsDetailPanelOpen(false);
    };

    const getAddDialogTitle = () => {
        if (addContext.relationType && addContext.relatedTo) {
            const name = `${addContext.relatedTo.first_name} ${addContext.relatedTo.last_name}`;
            switch (addContext.relationType) {
                case 'parent': return `Add Parent of ${name}`;
                case 'spouse': return `Add Spouse of ${name}`;
                case 'child': return `Add Child of ${name}`;
            }
        }
        return 'Add Family Member';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2E9' }}>
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-2 rounded-full mx-auto mb-4" style={{ borderColor: '#64303A', borderTopColor: 'transparent' }}></div>
                    <p className="text-gray-600">Loading your family tree...</p>
                </div>
            </div>
        );
    }

    if (!familyTree) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2E9' }}>
                <div className="text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#64303A' }}>No Family Tree Found</h2>
                    <p className="text-gray-600 mb-4">Create your family tree from the dashboard first.</p>
                    <Link href="/dashboard">
                        <Button style={{ backgroundColor: '#64303A', color: 'white' }}>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
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
                                    Dashboard
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: '#64303A' }}>{familyTree.name}</h1>
                                <p className="text-sm text-gray-600">
                                    {familyMembers.length}/25 members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Button variant="outline" size="sm" onClick={handleShare}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Badge className="absolute -top-2 -right-2 bg-heritage-saffron text-white text-[10px] px-1">
                                    Soon
                                </Badge>
                            </div>

                            <div className="relative">
                                <Button variant="outline" size="sm" onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <Badge className="absolute -top-2 -right-2 bg-heritage-saffron text-white text-[10px] px-1">
                                    Soon
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <TreeVisualization
                    familyMembers={familyMembers}
                    relationships={relationships}
                    selectedMember={selectedMember}
                    onSelectMember={handleSelectMember}
                    onAddMember={handleOpenAddMember}
                />
            </div>

            {/* Member Detail Panel */}
            <MemberDetailPanel
                member={selectedMember}
                isOpen={isDetailPanelOpen}
                onClose={() => setIsDetailPanelOpen(false)}
                onUpdate={handleUpdateMember}
                onDelete={handleDeleteMember}
                onAddRelationship={() => {
                    setIsDetailPanelOpen(false);
                    setIsAddingRelationship(true);
                }}
            />

            {/* Add Member Dialog */}
            <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{getAddDialogTitle()}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={newMemberData.first_name}
                                    onChange={(e) => setNewMemberData(prev => ({ ...prev, first_name: e.target.value }))}
                                    placeholder="Enter first name"
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={newMemberData.last_name}
                                    onChange={(e) => setNewMemberData(prev => ({ ...prev, last_name: e.target.value }))}
                                    placeholder="Enter last name"
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                                    maxLength={50}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={newMemberData.gender}
                                onValueChange={(value) => setNewMemberData(prev => ({ ...prev, gender: value }))}
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

                        <div>
                            <Label htmlFor="birth_date">Date of Birth</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={newMemberData.birth_date}
                                onChange={(e) => setNewMemberData(prev => ({ ...prev, birth_date: e.target.value }))}
                                className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                            />
                        </div>

                        <div>
                            <Label htmlFor="death_date" className="text-muted-foreground">Death Date (if deceased)</Label>
                            <Input
                                id="death_date"
                                type="date"
                                value={newMemberData.death_date}
                                onChange={(e) => setNewMemberData(prev => ({ ...prev, death_date: e.target.value }))}
                                className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900"
                            />
                        </div>

                        <Separator />

                        {/* Coming Soon Section */}
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between text-muted-foreground p-2">
                                    <span className="flex items-center gap-2 text-sm">
                                        <Lock className="h-4 w-4" />
                                        Cultural & Life Details
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-3 bg-muted/30 rounded-lg mt-1 text-sm text-muted-foreground">
                                    <p className="mb-2">Available in Heritage Explorer:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                                        <li>Birth & Death Places</li>
                                        <li>Religion & Cultural Details</li>
                                        <li>Education & Occupation</li>
                                        <li>Life Events & Biography</li>
                                    </ul>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleAddMember} className="flex-1 text-white" style={{ backgroundColor: '#64303A' }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Member
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setIsAddingMember(false);
                                setAddContext({});
                            }}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Relationship Dialog */}
            <AddRelationshipDialog
                open={isAddingRelationship}
                onOpenChange={setIsAddingRelationship}
                familyMembers={familyMembers}
                selectedMember={selectedMember}
                onAddRelationship={handleAddRelationship}
            />
        </div>
    );
};

export default FamilyTreeBuilder;
