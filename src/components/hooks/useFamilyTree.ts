import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface FamilyMember {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: string;
    birth_date?: string;
    death_date?: string;
    photo_url?: string;
    is_root?: boolean;
}

export interface Relationship {
    id: string;
    person1_id: string;
    person2_id: string;
    relationship_type: string;
    marriage_date?: string;
    divorce_date?: string;
    nature?: 'biological' | 'adopted';
}

export interface FamilyTree {
    id: string;
    name: string;
}

export const useFamilyTree = (treeId: string) => {
    const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTreeData = useCallback(async () => {
        if (!treeId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/trees/${treeId}`);
            if (!res.ok) throw new Error('Failed to fetch tree');
            const data = await res.json();

            setFamilyTree({ id: data.tree._id, name: data.tree.name });
            setFamilyMembers(data.members.map((m: any) => ({
                id: m._id,
                first_name: m.first_name,
                middle_name: m.middle_name || '',
                last_name: m.last_name,
                gender: m.gender,
                birth_date: m.birth_date ? m.birth_date.split('T')[0] : '',
                death_date: m.death_date ? m.death_date.split('T')[0] : '',
                photo_url: m.photo_url,
                is_root: m.is_root
            })));
            setRelationships(data.relationships.map((r: any) => ({
                id: r._id,
                person1_id: r.person1_id,
                person2_id: r.person2_id,
                relationship_type: r.relationship_type,
                marriage_date: r.marriage_date ? r.marriage_date.split('T')[0] : undefined,
                divorce_date: r.divorce_date ? r.divorce_date.split('T')[0] : undefined,
                nature: r.nature
            })));
        } catch (error) {
            console.error(error);
            toast.error('Error loading family tree');
        } finally {
            setLoading(false);
        }
    }, [treeId]);

    useEffect(() => {
        fetchTreeData();
    }, [fetchTreeData]);

    const addFamilyMember = useCallback(async (data: Omit<FamilyMember, 'id'>) => {
        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, tree_id: treeId })
            });
            if (!res.ok) throw new Error('Failed to add member');
            const newMemberData = await res.json();

            const newMember = {
                id: newMemberData._id,
                first_name: newMemberData.first_name,
                middle_name: newMemberData.middle_name || '',
                last_name: newMemberData.last_name,
                gender: newMemberData.gender,
                birth_date: newMemberData.birth_date ? newMemberData.birth_date.split('T')[0] : '',
                death_date: newMemberData.death_date ? newMemberData.death_date.split('T')[0] : '',
                photo_url: newMemberData.photo_url,
                is_root: newMemberData.is_root
            };

            setFamilyMembers((prev) => [...prev, newMember]);
            return newMember;
        } catch (error) {
            console.error(error);
            // toast.error('Failed to add member');
            throw error;
        }
    }, [treeId]);

    const updateFamilyMember = useCallback(async (id: string, data: Partial<FamilyMember>) => {
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update member');

            setFamilyMembers((prev) =>
                prev.map((member) => (member.id === id ? { ...member, ...data } : member))
            );
            toast.success('Member updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update member');
        }
    }, []);

    const deleteFamilyMember = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete member');

            setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
            setRelationships(prev => prev.filter(r => r.person1_id !== id && r.person2_id !== id));

            toast.success('Member deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete member');
        }
    }, []);

    const addRelationship = useCallback(async (data: Omit<Relationship, 'id'>) => {
        const exists = relationships.some(rel =>
            (rel.person1_id === data.person1_id && rel.person2_id === data.person2_id && rel.relationship_type === data.relationship_type) ||
            (data.relationship_type === 'spouse' && rel.person1_id === data.person2_id && rel.person2_id === data.person1_id && rel.relationship_type === 'spouse')
        );

        if (exists) {
            console.warn('Relationship already exists');
            return;
        }

        try {
            const res = await fetch('/api/relationships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, tree_id: treeId })
            });

            if (!res.ok) {
                if (res.status === 409) {
                    toast.warning('Relationship already exists');
                    return;
                }
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to add relationship');
            }

            const newRelData = await res.json();
            const newRelationship = {
                id: newRelData._id,
                person1_id: newRelData.person1_id,
                person2_id: newRelData.person2_id,
                relationship_type: newRelData.relationship_type,
                marriage_date: newRelData.marriage_date ? newRelData.marriage_date.split('T')[0] : undefined,
                divorce_date: newRelData.divorce_date ? newRelData.divorce_date.split('T')[0] : undefined,
                nature: newRelData.nature
            };
            setRelationships((prev) => [...prev, newRelationship]);
            toast.success('Relationship added successfully');
        } catch (error: any) {
            console.error(error);
            // toast.error(error.message || 'Failed to add relationship');
            throw error;
        }
    }, [treeId, relationships]);

    const updateRelationship = useCallback(async (id: string, data: Partial<Relationship>) => {
        try {
            const res = await fetch(`/api/relationships/${id}`, { // We'll need to handle route param or just put id in body? API design check.
                // Wait, standard CRUD usually puts ID in URL. But I didn't check if [id] route exists.
                // Let's assume standard REST, but I might need to create the route.
                // Actually, let's check if the route exists or if I need to make one.
                // Checking previous view_file of api/relationships/route.ts showed only POST.
                // So I probably need to create api/relationships/[id]/route.ts or handle PUT in the main route.
                // I'll assume I need to CREATE the dynamic route.
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to update relationship');

            const updatedRel = await res.json();
            setRelationships(prev => prev.map(r => r.id === id ? {
                ...r,
                ...updatedRel,
                marriage_date: updatedRel.marriage_date ? updatedRel.marriage_date.split('T')[0] : undefined,
                divorce_date: updatedRel.divorce_date ? updatedRel.divorce_date.split('T')[0] : undefined
            } : r));

        } catch (error) {
            console.error(error);
            toast.error('Failed to update relationship');
            throw error;
        }
    }, []);

    return {
        familyTree,
        familyMembers,
        relationships,
        loading,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        addRelationship,
        updateRelationship,
    };
};
