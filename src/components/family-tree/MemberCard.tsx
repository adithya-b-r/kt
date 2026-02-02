import React from 'react';
import { Plus, Pencil } from 'lucide-react'; // Can use Lucide icons inside buttons if we want, or plain text
import { FamilyMember } from '@/components/hooks/useFamilyTree';
import styles from './family-tree.module.css';

interface MemberCardProps {
    member: FamilyMember;
    isSelected?: boolean;
    isRoot?: boolean;
    onClick: () => void;
    // We retain these props to hook up the actions
    onAddParent?: () => void;
    onAddSpouse?: () => void;
    onAddChild?: () => void;
    onNodeDelete?: () => void; // Added for delete action
    hasHiddenFamily?: boolean; // To show the dumbbell icon
    onViewFamily?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
    member,
    isSelected,
    isRoot,
    onClick,
    onAddParent,
    onAddSpouse,
    onAddChild,
    onNodeDelete,
    hasHiddenFamily,
    onViewFamily,
}) => {
    const birthYear = member.birth_date ? new Date(member.birth_date).getFullYear() : '';

    // Construct class names manually or with a helper if preferred
    // Using string interpolation for simplicity with the module
    const genderClass = member.gender === 'male' ? styles.male : member.gender === 'female' ? styles.female : styles.other;
    const rootClass = isRoot ? styles.focusedRoot : '';
    const nodeClasses = `${styles.node} ${genderClass} ${rootClass}`;

    return (
        // The container div acts as ".node"
        <div
            className={nodeClasses}
            onClick={(e) => {
                e.stopPropagation(); // prevent drag start on click?
                onClick();
            }}
            // Style overrides for selection could go here if needed, or add another class
            style={{
                borderColor: isSelected ? '#4a90e2' : undefined,
                boxShadow: isSelected ? '0 0 0 2px #4a90e2' : undefined
            }}
        >
            {/* Dumbbell Icon for "View Family" if applicable */}
            {hasHiddenFamily && !isRoot && (
                <button
                    className={styles.dumbbellBtn}
                    title="View Family"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewFamily?.();
                    }}
                >
                    <svg viewBox="0 0 24 14">
                        <rect x="0" y="2" width="8" height="10" rx="2" ry="2" />
                        <rect x="16" y="2" width="8" height="10" rx="2" ry="2" />
                        <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            )}

            {/* Actions Overlay */}
            <div className={styles.actionsOverlay}>
                {/* The "Add Relation" button representing the picker opener */}
                <button
                    className={`${styles.actBtn} ${styles.addC} ${member.gender === 'male' ? styles.btnMale : member.gender === 'female' ? styles.btnFemale : ''}`}
                    title="Add Relation"
                    onClick={(e) => { e.stopPropagation(); onAddChild?.(); }}
                >
                    ➕
                </button>
            </div>

            {/* Avatar */}
            <div className={styles.avatar}>
                {member.photo_url ? (
                    <img src={member.photo_url} alt={member.first_name} />
                ) : (
                    member.first_name[0]
                )}
            </div>

            {/* Info */}
            <div className={styles.info}>
                <div className={styles.name}>
                    {member.first_name} {member.last_name}
                    <span className={`${styles.genderSymbol} ${genderClass}`}>
                        {member.gender === 'male' ? '♂' : member.gender === 'female' ? '♀' : ''}
                    </span>
                </div>
                {birthYear && (
                    <div className={styles.details}>
                        {birthYear}
                    </div>
                )}
            </div>
        </div>
    );
};
