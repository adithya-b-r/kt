import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/components/hooks/useFamilyTree';
import { toast } from '@/components/ui/sonner';

interface AddRelationshipDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    familyMembers: FamilyMember[];
    selectedMember?: FamilyMember | null;
    onAddRelationship: (relationshipData: {
        person1_id: string;
        person2_id: string;
        relationship_type: string;
        start_date?: string;
        end_date?: string;
        is_primary?: boolean;
        notes?: string;
        nature?: 'biological' | 'adopted';
    }) => Promise<void>;
}

const relationshipTypes = [
    { value: 'parent_of', label: 'Parent of' },
    { value: 'child_of', label: 'Child of' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'sibling', label: 'Sibling' },
];

export const AddRelationshipDialog: React.FC<AddRelationshipDialogProps> = ({
    open,
    onOpenChange,
    familyMembers,
    selectedMember,
    onAddRelationship
}) => {
    const [relationshipData, setRelationshipData] = useState({
        person1_id: selectedMember?.id || '',
        person2_id: '',
        relationship_type: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (!relationshipData.person1_id || !relationshipData.person2_id || !relationshipData.relationship_type) {
            return;
        }

        let finalPerson1 = relationshipData.person1_id;
        let finalPerson2 = relationshipData.person2_id;
        let finalType = relationshipData.relationship_type;

        if (relationshipData.relationship_type === 'spouse') {
            const person1 = familyMembers.find(m => m.id === relationshipData.person1_id);
            const person2 = familyMembers.find(m => m.id === relationshipData.person2_id);

            if (person1?.gender && person2?.gender && person1.gender === person2.gender) {
                toast.error('Both parents cannot be of the same gender');
                return;
            }
        }

        if (relationshipData.relationship_type === 'parent_of') {
            finalType = 'parent_child';
        } else if (relationshipData.relationship_type === 'child_of') {
            finalType = 'parent_child';
            finalPerson1 = relationshipData.person2_id;
            finalPerson2 = relationshipData.person1_id;
        }

        try {
            setIsSubmitting(true);
            await onAddRelationship({
                person1_id: finalPerson1,
                person2_id: finalPerson2,
                relationship_type: finalType,
                nature: (relationshipData as any).nature || 'biological'
            });

            setRelationshipData({
                person1_id: selectedMember?.id || '',
                person2_id: '',
                relationship_type: '',
            });

            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to add relationship:', error);
            toast.error(error.message || 'Failed to add relationship');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableMembers = familyMembers.filter(member => member.id !== relationshipData.person1_id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Family Relationship</DialogTitle>
                    <DialogDescription>
                        Select two family members to create a relationship between them.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="person1">First Person</Label>
                        <Select
                            value={relationshipData.person1_id}
                            onValueChange={(value) => setRelationshipData(prev => ({ ...prev, person1_id: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select first person" />
                            </SelectTrigger>
                            <SelectContent>
                                {familyMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.first_name} {member.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="relationship_type">Relationship Type</Label>
                        <Select
                            value={relationshipData.relationship_type}
                            onValueChange={(value) => setRelationshipData(prev => ({ ...prev, relationship_type: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select relationship type" />
                            </SelectTrigger>
                            <SelectContent>
                                {relationshipTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>



                    {(relationshipData.relationship_type === 'parent_of' || relationshipData.relationship_type === 'child_of') && (
                        <div className="space-y-2">
                            <Label>Relationship Nature</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="nature"
                                        value="biological"
                                        checked={(relationshipData as any).nature !== 'adopted'}
                                        onChange={() => setRelationshipData(prev => ({ ...prev, nature: 'biological' }))}
                                        className="accent-[#64303A]"
                                    />
                                    <span>Biological</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="nature"
                                        value="adopted"
                                        checked={(relationshipData as any).nature === 'adopted'}
                                        onChange={() => setRelationshipData(prev => ({ ...prev, nature: 'adopted' }))}
                                        className="accent-[#64303A]"
                                    />
                                    <span>Adopted</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="person2">Second Person</Label>
                        <Select
                            value={relationshipData.person2_id}
                            onValueChange={(value) => setRelationshipData(prev => ({ ...prev, person2_id: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select second person" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.first_name} {member.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={
                                isSubmitting ||
                                !relationshipData.person1_id ||
                                !relationshipData.person2_id ||
                                !relationshipData.relationship_type
                            }
                        >
                            {isSubmitting ? 'Adding...' : 'Add Relationship'}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent >
        </Dialog >
    );
};
