'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Plus,
    Users,
    Share2,
    Download,
    ArrowLeft,
    Lock,
    ChevronDown,
    User,
    Image as ImageIcon,
    FileText,
    Truck,
    UserPlus,
    Heart,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyTree, FamilyMember } from '@/components/hooks/useFamilyTree';
import { TreeVisualization, TreeVisualizationHandle } from './TreeVisualization';
import { MemberDetailPanel } from './MemberDetailPanel';
import { AddRelationshipDialog } from './AddRelationshipDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { jsPDF, GState } from 'jspdf';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';

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
        updateRelationship,
    } = useFamilyTree(treeId);

    const { user } = useAuth();
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isAddingRelationship, setIsAddingRelationship] = useState(false);
    const [isCreatingMember, setIsCreatingMember] = useState(false);
    const [initGender, setInitGender] = useState<string>('male');
    const [openSearch, setOpenSearch] = useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpenSearch((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, []);

    const [addContext, setAddContext] = useState<{
        relationType?: 'parent' | 'spouse' | 'child';
        relatedTo?: FamilyMember;
    }>({});

    const [newMemberData, setNewMemberData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        birth_date: '',
        death_date: '',
        photo_url: '',
        marriage_date: '',
        divorce_date: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMemberData(prev => ({ ...prev, photo_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const spouseGenderConflict =
        addContext.relationType === 'spouse' &&
        !!addContext.relatedTo?.gender &&
        !!newMemberData.gender &&
        addContext.relatedTo.gender === newMemberData.gender;

    const getSpouseById = (memberId: string) => {
        const spouseRel = relationships.find(r =>
            r.relationship_type === 'spouse' && (r.person1_id === memberId || r.person2_id === memberId)
        );
        if (!spouseRel) return null;
        const spouseId = spouseRel.person1_id === memberId ? spouseRel.person2_id : spouseRel.person1_id;
        return familyMembers.find(m => m.id === spouseId) || null;
    };

    const getSpouseRelationship = (memberId: string) => {
        return relationships.find(r =>
            r.relationship_type === 'spouse' && (r.person1_id === memberId || r.person2_id === memberId)
        );
    };

    const selectedSpouse = useMemo(() => {
        if (!selectedMember) return null;
        return getSpouseById(selectedMember.id);
    }, [selectedMember, relationships, familyMembers]);

    const selectedParents = useMemo(() => {
        if (!selectedMember) return [] as FamilyMember[];
        const parentIds = relationships
            .filter(r => r.relationship_type === 'parent_child' && r.person2_id === selectedMember.id)
            .map(r => r.person1_id);
        return parentIds
            .map(parentId => familyMembers.find(m => m.id === parentId))
            .filter((parent): parent is FamilyMember => !!parent);
    }, [selectedMember, relationships, familyMembers]);

    const handleSelectMember = (member: FamilyMember) => {
        setSelectedMember(member);
        setIsDetailPanelOpen(true);
    };

    const handleAddMember = async () => {
        if (isCreatingMember) return;
        if (!newMemberData.first_name || !newMemberData.last_name) {
            toast.error('First name and last name are required');
            return;
        }

        if (spouseGenderConflict) {
            toast.error('Both parents cannot be of the same gender');
            return;
        }

        const limit = user?.tree_limit || 100;
        if (familyMembers.length >= limit) {
            toast.error(`Plan limit reached (${limit} members). Upgrade to Pro for more!`);
            return;
        }

        try {
            setIsCreatingMember(true);
            const newMember = await addFamilyMember(newMemberData);

            if (addContext.relationType && addContext.relatedTo && newMember) {
                let person1_id: string, person2_id: string, relationship_type: string;

                switch (addContext.relationType) {
                    case 'parent':
                        // VALIDATION: Check if a parent of the same gender already exists
                        const existingParents = relationships
                            .filter(r => r.relationship_type === 'parent_child' && r.person2_id === addContext.relatedTo!.id)
                            .map(r => familyMembers.find(m => m.id === r.person1_id))
                            .filter((m): m is FamilyMember => !!m);

                        const duplicateGenderParent = existingParents.find(p => p.gender === newMemberData.gender);
                        if (duplicateGenderParent) {
                            // If we just added this member, we should strictly roll it back, but for now we'll just stop linking
                            // Realistically we should probably check this BEFORE creating the member, but the flow is currently "Create then Link"
                            // For a better UX we'd check before opening modal, but let's just error here and maybe clean up (or just leave them as unlinked member)
                            toast.error(`This person already has a ${newMemberData.gender} parent.`);
                            // Optional: delete the just-created member to clean up?
                            await deleteFamilyMember(newMember.id);
                            return;
                        }

                        person1_id = newMember.id;
                        person2_id = addContext.relatedTo.id;
                        relationship_type = 'parent_child';

                        // Check if the child already has a parent (to link as spouse)
                        const existingParentRel = relationships.find(r =>
                            r.relationship_type === 'parent_child' &&
                            r.person2_id === addContext.relatedTo!.id
                        );

                        if (existingParentRel) {
                            const existingParentId = existingParentRel.person1_id;

                            // 1. Link as Spouse
                            setTimeout(() => {
                                // Add spouse relationship
                                addRelationship({
                                    person1_id: existingParentId,
                                    person2_id: newMember.id,
                                    relationship_type: 'spouse'
                                });

                                // 2. Link to other siblings (children of the existing parent)
                                // Find all children of the existing parent
                                const existingSiblings = relationships
                                    .filter(r => r.relationship_type === 'parent_child' && r.person1_id === existingParentId)
                                    .map(r => r.person2_id)
                                    .filter(childId => childId !== addContext.relatedTo!.id); // Exclude the child we are already linking to

                                // Create relationships for other siblings
                                existingSiblings.forEach(siblingId => {
                                    addRelationship({
                                        person1_id: newMember.id,
                                        person2_id: siblingId,
                                        relationship_type: 'parent_child'
                                    });
                                });
                            }, 100);
                        }
                        break;
                    case 'child':
                        person1_id = addContext.relatedTo.id;
                        person2_id = newMember.id;
                        relationship_type = 'parent_child';

                        const spouseRel = relationships.find(r =>
                            r.relationship_type === 'spouse' &&
                            (r.person1_id === addContext.relatedTo!.id || r.person2_id === addContext.relatedTo!.id)
                        );

                        if (spouseRel) {
                            const spouseId = spouseRel.person1_id === addContext.relatedTo.id ? spouseRel.person2_id : spouseRel.person1_id;
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
                        if (newMemberData.gender && addContext.relatedTo.gender &&
                            newMemberData.gender === addContext.relatedTo.gender) {
                            toast.error('Both parents cannot be of the same gender');
                            // Clean up
                            await deleteFamilyMember(newMember.id);
                            return;
                        }
                        person1_id = addContext.relatedTo.id;
                        person2_id = newMember.id;
                        relationship_type = 'spouse';

                        // Extract dates meant for relationship, NOT the member
                        const { marriage_date, divorce_date } = newMemberData as any;


                        // LOGIC: Link existing children to the new spouse
                        // 1. Find all children of the 'relatedTo' (the original spouse)
                        const currentSpouseChildren = relationships
                            .filter(r => r.relationship_type === 'parent_child' && r.person1_id === addContext.relatedTo!.id)
                            .map(r => r.person2_id);

                        // 2. Link them to the new spouse (newMember)
                        if (currentSpouseChildren.length > 0) {
                            // We do this via setTimeout or Promise.all to ensure order or just fire them off
                            setTimeout(() => {
                                currentSpouseChildren.forEach(childId => {
                                    addRelationship({
                                        person1_id: newMember.id,
                                        person2_id: childId,
                                        relationship_type: 'parent_child'
                                    });
                                });
                            }, 100);
                        }
                        break;
                    default:
                        person1_id = '';
                        person2_id = '';
                        relationship_type = '';
                }


                if (person1_id && person2_id) {
                    const extraData: any = {};
                    if (relationship_type === 'spouse') {
                        if ((newMemberData as any).marriage_date) extraData.marriage_date = (newMemberData as any).marriage_date;
                        if ((newMemberData as any).divorce_date) extraData.divorce_date = (newMemberData as any).divorce_date;
                    }

                    await addRelationship({ person1_id, person2_id, relationship_type, ...extraData });
                }
            }

            setIsAddingMember(false);
            setAddContext({});
            setNewMemberData({
                first_name: '',
                middle_name: '',
                last_name: '',
                gender: '',
                birth_date: '',
                death_date: '',
                photo_url: '',
                marriage_date: '',
                divorce_date: '',
            });
            toast.success('Family member added successfully!');
        } catch (error) {
            console.error('Failed to add family member:', error);
            toast.error('Failed to add family member');
        } finally {
            setIsCreatingMember(false);
        }
    };

    const handleOpenAddMember = (relationType?: 'parent' | 'spouse' | 'child' | 'sibling' | null, relatedTo?: FamilyMember | null, gender?: 'male' | 'female') => {
        // We only support parent/spouse/child for now in terms of logic, sibling is just a placeholder in picker that maps to parent logic usually
        // But for now let's just cast it or ignore sibling specific logic if not implemented
        const supportedType = (relationType === 'sibling') ? 'child' : relationType; // If sibling, it means adding child to parent? No, "Add Sibling" means adding another child to MY parents.
        // Actually, for "Add Sibling", the caller (TreeVisualization) handles finding the parent and calling 'add child' on the parent.
        // So here we might receive 'child' if the logic was pre-processed, OR we just accept the type.

        // However, the TreeVisualization calls onAddMember with the raw type from picker.
        // Let's coerce for now to satisfy TS if we aren't changing the logic deeply.

        setAddContext({ relationType: supportedType as 'parent' | 'spouse' | 'child' | undefined, relatedTo: relatedTo || undefined });
        // ... (rest)

        let initialLastName = '';
        if (relatedTo && (relationType === 'child' || relationType === 'spouse')) {
            if (relationType === 'child') {
                initialLastName = relatedTo.last_name;
            }
        }

        setNewMemberData(prev => {
            let defaultGender = gender || '';
            const relatedGender = relatedTo?.gender;

            // Logic for Spouse: Opposite gender
            if (relationType === 'spouse' && relatedGender && !defaultGender) {
                defaultGender = relatedGender === 'male' ? 'female' : 'male';
            }

            // Logic for Parent: If gender is passed (Father/Mother), uses that.
            // If not passed (generic 'Add Parent'), default to logic?? Usually Picker sends it.

            // Logic for Child: If gender passed (Son/Daughter), use that.

            return {
                first_name: '',
                middle_name: '',
                last_name: initialLastName,
                gender: defaultGender,
                birth_date: '',
                death_date: '',
                photo_url: '',
                marriage_date: '',
                divorce_date: '',
            };
        });
        setIsAddingMember(true);
    };

    const treeRef = useRef<TreeVisualizationHandle>(null);

    const handleExportPDF = async () => {
        if (!treeRef.current) return;

        const toastId = toast.loading('Generating PDF...');

        try {
            const { dataUrl, width, height } = await treeRef.current.getExportData({ scale: 1.0 });

            const pdf = new jsPDF({
                orientation: width > height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [width, height]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);

            // Add Watermark for Free Plan
            if (user?.plan_type !== 'pro') {
                pdf.saveGraphicsState(); // Save state before changes

                pdf.setTextColor(150, 150, 150); // Gray
                pdf.setFont('helvetica', 'bold'); // Bold

                // Dynamic font size: ~1/10th of the width, ensuring it's at least 40px
                const fontSize = Math.max(40, Math.floor(width / 10));
                pdf.setFontSize(fontSize);

                // Set transparency
                try {
                    const gState = new GState({ opacity: 0.4 });
                    pdf.setGState(gState);
                } catch (e) {
                    console.warn("GState not supported or failed", e);
                }

                // Calculate diagonal angle to center exactly from corner to corner (Bottom-Left to Top-Right)
                const angle = Math.atan(height / width) * (180 / Math.PI);

                // Manual centering
                const angleRad = angle * (Math.PI / 180);
                const offset = fontSize / 3;
                const x = width / 2 + offset * Math.sin(angleRad);
                const y = height / 2 - offset * Math.cos(angleRad);

                pdf.text('Kutumba Tree', x, y, { align: 'center', angle: angle });
                pdf.restoreGraphicsState(); // Restore state
            }


            pdf.save(`${familyTree?.name || 'My_Family_Tree'}.pdf`);

            toast.dismiss(toastId);
            toast.success('Family tree exported as PDF!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.dismiss(toastId);
            toast.error('Failed to export family tree');
        }
    };

    const handleExportImage = async () => {
        if (!treeRef.current) return;

        const toastId = toast.loading('Generating Image...');

        try {
            const { dataUrl, width, height } = await treeRef.current.getExportData();

            let finalDataUrl = dataUrl;

            // Add Watermark for Free Plan (Process via Canvas)
            if (user?.plan_type !== 'pro') {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (ctx) {
                        // Load image to draw it on canvas
                        const img = new Image();
                        img.src = dataUrl;
                        await new Promise((resolve) => {
                            img.onload = resolve;
                        });

                        // Use actual image dimensions to avoid clipping on high-DPI screens
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;

                        // Draw original image
                        ctx.drawImage(img, 0, 0);

                        // Configure Watermark Styles
                        ctx.fillStyle = 'rgba(150, 150, 150, 0.4)'; // Gray with 40% opacity
                        // Font size logic: ~1/10th of width, min 40px
                        const fontSize = Math.max(40, Math.floor(canvas.width / 10));
                        ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        // Calculate visual center and rotation
                        const angleRad = Math.atan(canvas.height / canvas.width);
                        const cx = canvas.width / 2;
                        const cy = canvas.height / 2;

                        // Rotate and Draw
                        ctx.save();
                        ctx.translate(cx, cy);
                        // Standard math: atan(y/x). 
                        // Top-Left (0,0) to Bottom-Right (w,h) means positive y is down.
                        // We want "Bottom-Left" (visual) to "Top-Right" (visual).
                        // That means vector (1, -1) visually, but in canvas coords (1, -1).
                        // Actually, let's just stick to the angle calculation that works.
                        ctx.rotate(Math.atan(-canvas.height / canvas.width));

                        ctx.fillText('Kutumba Tree', 0, 0);
                        ctx.restore();

                        finalDataUrl = canvas.toDataURL('image/png');
                    }
                } catch (e) {
                    console.error('Failed to apply watermark to image, downloading original', e);
                }
            }

            const link = document.createElement('a');
            link.href = finalDataUrl;
            link.download = `${familyTree?.name || 'My_Family_Tree'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.dismiss(toastId);
            toast.success('Family tree exported as Image!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.dismiss(toastId);
            toast.error('Failed to export family tree image');
        }
    };

    const handleHomeDelivery = () => {
        toast.info('Home Delivery Feature Coming Soon', {
            description: 'Get a high-quality printed version of your family tree delivered to your doorstep.',
            duration: 5000,
        });
    };

    const handleShare = () => {
        toast.info('Sharing feature coming soon in Heritage Explorer!');
    };

    const handleRepairTree = async () => {
        const toastId = toast.loading('Checking family connections...');
        let fixesApplied = 0;

        try {
            // 1. Find all spouse relationships
            const spouseRels = relationships.filter(r => r.relationship_type === 'spouse');

            // Loop through each spouse pair
            for (const rel of spouseRels) {
                const spouse1 = rel.person1_id;
                const spouse2 = rel.person2_id;

                // Find children of spouse 1
                const children1 = relationships
                    .filter(r => r.relationship_type === 'parent_child' && r.person1_id === spouse1)
                    .map(r => r.person2_id);

                // Find children of spouse 2
                const children2 = relationships
                    .filter(r => r.relationship_type === 'parent_child' && r.person1_id === spouse2)
                    .map(r => r.person2_id);

                // Identify children that need linking
                // Children of S1 that are NOT linked to S2
                const missingForS2 = children1.filter(cId => !children2.includes(cId));

                // Children of S2 that are NOT linked to S1
                const missingForS1 = children2.filter(cId => !children1.includes(cId));

                // Apply fixes
                if (missingForS2.length > 0) {
                    for (const childId of missingForS2) {
                        await addRelationship({
                            person1_id: spouse2,
                            person2_id: childId,
                            relationship_type: 'parent_child'
                        });
                        fixesApplied++;
                    }
                }

                if (missingForS1.length > 0) {
                    for (const childId of missingForS1) {
                        await addRelationship({
                            person1_id: spouse1,
                            person2_id: childId,
                            relationship_type: 'parent_child'
                        });
                        fixesApplied++;
                    }
                }
            }

            toast.dismiss(toastId);
            if (fixesApplied > 0) {
                toast.success(`Tree repaired! Fixed ${fixesApplied} missing parent links.`);
            } else {
                toast.info('Tree is healthy! No missing links found.');
            }

        } catch (error) {
            console.error('Repair failed:', error);
            toast.dismiss(toastId);
            toast.error('Failed to repair tree.');
        }
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
        if (data.gender) {
            const spouse = getSpouseById(id);
            if (spouse?.gender && spouse.gender === data.gender) {
                toast.error('Parents cannot have the same gender');
                return;
            }
        }

        await updateFamilyMember(id, data);
        if (selectedMember?.id === id) {
            setSelectedMember(prev => prev ? { ...prev, ...data } : null);
        }
    };

    const handleDeleteMember = async (id: string) => {
        // Validation: Check if member has children
        const hasChildren = relationships.some(r =>
            r.relationship_type === 'parent_child' && r.person1_id === id
        );

        if (hasChildren) {
            const errorMsg = 'Cannot delete member: This person has connected children. Please remove the children or parent links first.';
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }

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

    if (familyMembers.length === 0 && user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F2E9' }}>
                <Card className="max-w-md w-full shadow-xl border-t-4 border-t-[#64303A]">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="h-8 w-8 text-[#64303A]" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-[#64303A]">Welcome, {user.first_name}!</CardTitle>
                        <CardDescription>
                            Your family tree is currently empty. Let's start by adding you as the root member.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="text-sm font-medium text-gray-500 mb-1">You will be added as:</div>
                                <div className="text-lg font-bold text-[#64303A]">
                                    {user.first_name} {user.middle_name ? user.middle_name + ' ' : ''}{user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>

                            <div className="space-y-2">
                                <Label>Select your gender to begin:</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${newMemberData.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setNewMemberData(prev => ({ ...prev, gender: 'male' }))}
                                    >
                                        <div className="font-semibold text-blue-700">Male</div>
                                    </div>
                                    <div
                                        className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${newMemberData.gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        onClick={() => setNewMemberData(prev => ({ ...prev, gender: 'female' }))}
                                    >
                                        <div className="font-semibold text-pink-700">Female</div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full text-white font-semibold py-6"
                                style={{ backgroundColor: '#64303A' }}
                                onClick={async () => {
                                    if (!user) return;
                                    if (!initGender) {
                                        toast.error("Please select a gender");
                                        return;
                                    }
                                    try {
                                        await addFamilyMember({
                                            first_name: user.first_name,
                                            middle_name: user.middle_name || '',
                                            last_name: user.last_name,
                                            gender: initGender,
                                            is_root: true
                                        });
                                        toast.success("Tree initialized successfully!");
                                    } catch (e) {
                                        toast.error("Failed to initialize tree");
                                    }
                                }}
                            >
                                Initialize My Tree
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F2E9' }}>
            <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm transition-all duration-200" style={{ borderColor: 'rgba(212, 197, 203, 0.5)' }}>
                <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left Side: Navigation & Title */}
                        <div className="flex items-center gap-4 min-w-0">
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 rounded-full p-0 hover:bg-black/5 text-gray-500 hover:text-gray-900 transition-colors"
                                    title="Back to Dashboard"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>

                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate text-gray-900 leading-tight">
                                        {familyTree.name}
                                    </h1>
                                    <Badge variant="secondary" className="hidden sm:inline-flex bg-[#64303A]/10 text-[#64303A] border-none px-2 py-0.5 h-5 text-[10px] font-semibold tracking-wide uppercase">
                                        FAMILY TREE
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                                    <Users className="h-3 w-3" />
                                    <span>{familyMembers.length} members</span>
                                    {user?.tree_limit && familyMembers.length >= user.tree_limit && (
                                        <span className="text-amber-600 ml-1 font-semibold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-100 uppercase tracking-wider">Limit Reached</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpenSearch(true)}
                                className="inline-flex h-9 w-9 lg:w-64 lg:justify-between lg:px-3 p-0 lg:py-2 items-center text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all font-normal"
                                title="Search (Ctrl + K)"
                            >
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    <span className="hidden lg:inline text-xs">Search members...</span>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="hidden sm:inline-flex h-9 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <Share2 className="h-4 w-4 mr-2 text-gray-500" />
                                Share
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs font-medium border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 gap-1.5 px-3"
                                    >
                                        <Download className="h-4 w-4 text-gray-500" />
                                        <span className="hidden sm:inline">Export</span>
                                        <ChevronDown className="h-3 w-3 text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl border-gray-100 shadow-lg bg-white/95 backdrop-blur-sm">
                                    <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer text-xs font-medium px-3 py-2.5 rounded-lg focus:bg-gray-50 transition-colors my-0.5">
                                        <FileText className="h-4 w-4 mr-3 text-red-500" />
                                        <div>
                                            <span className="block text-gray-700">Download PDF</span>
                                            <span className="block text-[10px] text-gray-400 font-normal">High quality printable format</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportImage} className="cursor-pointer text-xs font-medium px-3 py-2.5 rounded-lg focus:bg-gray-50 transition-colors my-0.5">
                                        <ImageIcon className="h-4 w-4 mr-3 text-blue-500" />
                                        <div>
                                            <span className="block text-gray-700">Download Image</span>
                                            <span className="block text-[10px] text-gray-400 font-normal">PNG format for sharing</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <Separator className="my-1 bg-gray-100" />
                                    <DropdownMenuItem onClick={handleHomeDelivery} className="cursor-pointer text-xs font-medium px-3 py-2.5 rounded-lg focus:bg-gray-50 transition-colors my-0.5 group">
                                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center mr-3 group-hover:bg-amber-100 transition-colors">
                                            <Truck className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <span className="block text-gray-900 font-semibold">Order Print</span>
                                            <span className="block text-[10px] text-amber-600 font-medium">Home Delivery 🚚</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <Separator className="my-1 bg-gray-100" />
                                    <DropdownMenuItem onClick={handleRepairTree} className="cursor-pointer text-xs font-medium px-3 py-2.5 rounded-lg focus:bg-gray-50 transition-colors my-0.5">
                                        <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                                            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="block text-gray-900 font-semibold">Fix Issues</span>
                                            <span className="block text-[10px] text-purple-600 font-medium">Auto-repair links 🪄</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

                            <Link href="/profile">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 rounded-full p-0 bg-gray-50 hover:bg-gray-100 border border-gray-100"
                                >
                                    <User className="h-4 w-4 text-gray-600" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 w-full">
                <TreeVisualization
                    familyMembers={familyMembers}
                    relationships={relationships}
                    selectedMember={selectedMember}
                    onSelectMember={handleSelectMember}
                    onAddMember={handleOpenAddMember}
                    ref={treeRef}
                />
            </div>


            <MemberDetailPanel
                member={selectedMember}
                parents={selectedParents}
                spouse={selectedSpouse}
                spouseRelationship={selectedMember ? getSpouseRelationship(selectedMember.id) : undefined}
                isOpen={isDetailPanelOpen}
                onClose={() => setIsDetailPanelOpen(false)}
                onUpdate={handleUpdateMember}
                onDelete={handleDeleteMember}
                onUpdateRelationship={updateRelationship}
                onAddRelationship={() => {
                    setIsDetailPanelOpen(false);
                    setIsAddingRelationship(true);
                }}
                hasChildren={relationships.some(r =>
                    r.relationship_type === 'parent_child' &&
                    r.person1_id === selectedMember?.id
                )}
            />

            <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
                <CommandInput placeholder="Search family members..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Members">
                        {familyMembers.map((member) => (
                            <CommandItem
                                key={member.id}
                                value={`${member.first_name} ${member.middle_name || ''} ${member.last_name}`}
                                onSelect={() => {
                                    setOpenSearch(false);
                                    treeRef.current?.focusNode(member.id);
                                    handleSelectMember(member);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {member.photo_url ? (
                                            <img src={member.photo_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-3 w-3 text-gray-400" />
                                        )}
                                    </div>
                                    <span>{member.first_name} {member.middle_name ? `${member.middle_name} ` : ''}{member.last_name}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

            <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">{getAddDialogTitle()}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">

                        {/* Image Upload for New Member */}
                        <div className="flex justify-center mb-4">
                            <div
                                className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {newMemberData.photo_url ? (
                                    <img src={newMemberData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                                        <span className="text-xs">Upload Photo</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                            <div>
                                <Label htmlFor="first_name" className="text-xs sm:text-sm">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={newMemberData.first_name}
                                    onChange={(e) => setNewMemberData(prev => ({ ...prev, first_name: e.target.value }))}
                                    placeholder="First name"
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900 text-xs sm:text-sm"
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <Label htmlFor="middle_name" className="text-xs sm:text-sm">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={newMemberData.middle_name}
                                    onChange={(e) => setNewMemberData(prev => ({ ...prev, middle_name: e.target.value }))}
                                    placeholder="Middle name"
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900 text-xs sm:text-sm"
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <Label htmlFor="last_name" className="text-xs sm:text-sm">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={newMemberData.last_name}
                                    onChange={(e) => setNewMemberData(prev => ({ ...prev, last_name: e.target.value }))}
                                    placeholder="Last name"
                                    className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900 text-xs sm:text-sm"
                                    maxLength={50}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="gender" className="text-xs sm:text-sm">Gender</Label>
                            <Select
                                value={newMemberData.gender}
                                onValueChange={(value) => setNewMemberData(prev => ({ ...prev, gender: value }))}
                            >
                                <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {addContext.relationType === 'spouse' && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    Relationship Status
                                </Label>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={!newMemberData.divorce_date ? "default" : "outline"}
                                        className={!newMemberData.divorce_date ? "bg-emerald-600 hover:bg-emerald-700 flex-1" : "flex-1"}
                                        onClick={() => setNewMemberData(prev => ({ ...prev, divorce_date: '' }))}
                                    >
                                        Married
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={newMemberData.divorce_date !== '' ? "default" : "outline"}
                                        className={newMemberData.divorce_date !== '' ? "bg-blue-600 hover:bg-blue-700 flex-1" : "flex-1"}
                                        onClick={() => setNewMemberData(prev => ({ ...prev, divorce_date: new Date().toISOString().split('T')[0] }))}
                                    >
                                        Divorced
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    {newMemberData.divorce_date === '' && (
                                        <div>
                                            <Label className="text-xs">Marriage Date</Label>
                                            <Input
                                                type="date"
                                                value={(newMemberData as any).marriage_date || ''}
                                                onChange={(e) => setNewMemberData(prev => ({ ...prev, marriage_date: e.target.value } as any))}
                                                className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-emerald-600"
                                            />
                                        </div>
                                    )}
                                    {newMemberData.divorce_date !== '' && (
                                        <div>
                                            <Label className="text-xs">Divorce Date</Label>
                                            <Input
                                                type="date"
                                                value={(newMemberData as any).divorce_date || ''}
                                                onChange={(e) => setNewMemberData(prev => ({ ...prev, divorce_date: e.target.value } as any))}
                                                className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-blue-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="birth_date" className="text-xs sm:text-sm">Date of Birth</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={newMemberData.birth_date}
                                onChange={(e) => setNewMemberData(prev => ({ ...prev, birth_date: e.target.value }))}
                                className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900 text-xs sm:text-sm"
                            />
                        </div>

                        <div>
                            <Label htmlFor="death_date" className="text-muted-foreground text-xs sm:text-sm">Death Date (if deceased)</Label>
                            <Input
                                id="death_date"
                                type="date"
                                value={newMemberData.death_date}
                                onChange={(e) => setNewMemberData(prev => ({ ...prev, death_date: e.target.value }))}
                                className="focus-visible:outline-none ring-transparent focus-visible:ring-0 focus-visible:border-orange-900 text-xs sm:text-sm"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <Separator />

                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between text-muted-foreground p-2 text-xs sm:text-sm">
                                    <span className="flex items-center gap-2">
                                        <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Cultural & Life Details
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </div>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-2 sm:p-3 bg-muted/30 rounded-lg mt-1 text-xs text-muted-foreground">
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

                        {spouseGenderConflict && (
                            <div className="p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs sm:text-sm">
                                <div className="shrink-0 pt-0.5">
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-amber-800">Gender Conflict</p>
                                    <p className="text-xs text-amber-700 mt-0.5">Both parents cannot be of the same gender. Please select a different gender.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={handleAddMember}
                                className="flex-1 text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                                style={{ backgroundColor: '#64303A' }}
                                disabled={spouseGenderConflict || isCreatingMember}
                            >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {isCreatingMember ? 'Adding...' : 'Add'}
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setIsAddingMember(false);
                                setAddContext({});
                            }} className="text-xs sm:text-sm">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AddRelationshipDialog
                open={isAddingRelationship}
                onOpenChange={setIsAddingRelationship}
                familyMembers={familyMembers}
                selectedMember={selectedMember}
                onAddRelationship={handleAddRelationship}
            />
        </div >
    );
};

export default FamilyTreeBuilder;
