import React from 'react';
import { Pencil, Network, Crown, Ribbon } from 'lucide-react';
import { FamilyMember } from '@/components/hooks/useFamilyTree';
import styles from './family-tree.module.css';

interface MemberCardProps {
    member: FamilyMember;
    isSelected?: boolean;
    isRoot?: boolean;
    onClick: () => void;
    onAddParent?: () => void;
    onAddSpouse?: () => void;
    onAddChild?: () => void;
    onNodeDelete?: () => void;
    hasHiddenFamily?: boolean;
    onViewFamily?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
    member,
    isSelected,
    isRoot,
    onClick,
    onAddChild,
    onNodeDelete,
    hasHiddenFamily,
    onViewFamily,
}) => {
    const birthDateObj = member.birth_date ? new Date(member.birth_date) : null;
    const birthYear = birthDateObj ? birthDateObj.getFullYear() : '';
    const isDeceased = !!member.death_date;

    const calculateAge = (birthDateStr?: string, deathDateStr?: string) => {
        if (!birthDateStr) return '';
        const birthDate = new Date(birthDateStr);
        const endDate = deathDateStr ? new Date(deathDateStr) : new Date();

        if (isNaN(birthDate.getTime())) return '';
        // If birth date is in the future relative to end date, return empty
        if (endDate < birthDate) return '';

        let years = endDate.getFullYear() - birthDate.getFullYear();
        const m = endDate.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
            years--;
        }

        if (years >= 1) {
            return `${years} yrs`;
        }

        // Less than 1 year, calculate months
        let months = (endDate.getFullYear() - birthDate.getFullYear()) * 12 + (endDate.getMonth() - birthDate.getMonth());
        if (endDate.getDate() < birthDate.getDate()) {
            months--;
        }

        if (months >= 1) {
            return `${months} months`;
        }

        // Less than 1 month, calculate days
        const diffTime = endDate.getTime() - birthDate.getTime();
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return `${days} days`;
    };

    const age = calculateAge(member.birth_date, member.death_date);

    const genderClass = member.gender === 'male' ? styles.male : member.gender === 'female' ? styles.female : styles.other;
    const rootClass = isRoot ? styles.focusedRoot : '';
    const nodeClasses = `${styles.node} ${genderClass} ${rootClass}`;

    return (
        <div
            className={nodeClasses}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            style={{
                // Optional: selection highlight could be a glow instead of border change to preserve gender color
                boxShadow: isSelected ? '0 0 0 3px rgba(66, 153, 225, 0.5)' : undefined,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Network Icon for "View Family" */}
            {hasHiddenFamily && !isRoot && (
                <button
                    className={styles.dumbbellBtn}
                    style={{ border: '2px solid green' }}
                    title="View Family"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewFamily?.();
                    }}
                >
                    <Network size={14} />
                </button>
            )}

            {/* Deceased Ribbon Icon */}
            {isDeceased && (
                <div
                    style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        zIndex: 11, // Above background, below actions
                        color: '#000000', // Black
                        filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.8))' // Minimal highlight for contrast
                    }}
                    title={`Deceased: ${member.death_date ? new Date(member.death_date).getFullYear() : 'Unknown'}`}
                >
                    <Ribbon size={16} fill="currentColor" />
                </div>
            )}

            {/* Avatar Wrapper */}
            <div style={{ position: 'relative' }}>
                <div
                    className={styles.avatar}
                    style={isDeceased ? { filter: 'grayscale(100%)', opacity: 0.9 } : undefined}
                >
                    {member.photo_url ? (
                        <img src={member.photo_url} alt={member.first_name} />
                    ) : (
                        member.first_name[0]
                    )}
                </div>
                {member.is_root && (
                    <div
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-sm border-[1.5px] border-white z-20 flex items-center justify-center"
                        title="Tree Owner"
                        style={{ width: '20px', height: '20px' }}
                    >
                        <Crown size={12} fill="currentColor" strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={styles.info}>
                <div className={styles.name}>
                    {member.first_name} {member.middle_name ? member.middle_name + ' ' : ''}{member.last_name}
                </div>
                <div className={styles.details}>
                    {birthYear}
                    {isDeceased && member.death_date && ` - ${new Date(member.death_date).getFullYear()}`}
                    {age && ` (${age})`}
                    {isDeceased && !member.death_date && ' - Deceased'}
                </div>
            </div>

            {/* Edit Button (Pencil) - Visual trigger for selection/edit */}
            <button className={styles.editBtn} aria-label="Edit">
                <Pencil size={14} />
            </button>

            {/* Actions Overlay - The "Hanging" Add Button */}
            <div className={styles.actionsOverlay}>
                <button
                    className={`${styles.actBtn} ${styles.addC}`}
                    title="Add Relation"
                    onClick={(e) => { e.stopPropagation(); onAddChild?.(); }}
                >
                    +
                </button>
            </div>
        </div>
    );
};
