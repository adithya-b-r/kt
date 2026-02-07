import React, { useEffect, useState, useRef } from 'react';
import { FamilyMember } from '@/components/hooks/useFamilyTree';
import styles from './family-tree.module.css';

interface RelationshipPickerProps {
    targetMember: FamilyMember;
    onClose: () => void;
    onOptionSelect: (relationType: 'parent' | 'spouse' | 'child' | 'sibling', gender?: 'male' | 'female') => void;
    existingRelations: {
        hasFather: boolean;
        hasMother: boolean;
        hasSpouse: boolean;
    };
}

export const RelationshipPicker: React.FC<RelationshipPickerProps> = ({
    targetMember,
    onClose,
    onOptionSelect,
    existingRelations
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [paths, setPaths] = useState<string[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);
    const fatherRef = useRef<HTMLDivElement>(null);
    const motherRef = useRef<HTMLDivElement>(null);
    const brotherRef = useRef<HTMLDivElement>(null);
    const sisterRef = useRef<HTMLDivElement>(null);
    const partnerRef = useRef<HTMLDivElement>(null);
    const sonRef = useRef<HTMLDivElement>(null);
    const daughterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Trigger generic open animation
        const timer = setTimeout(() => setIsOpen(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const getPath = (from: HTMLElement, to: HTMLElement) => {
        if (!containerRef.current) return '';
        const c = containerRef.current.getBoundingClientRect();
        const f = from.getBoundingClientRect();
        const t = to.getBoundingClientRect();

        const x1 = f.left - c.left + f.width / 2;
        const y1 = f.top - c.top + f.height / 2;

        const x2 = t.left - c.left + t.width / 2;
        const y2 = t.top - c.top + t.height / 2;

        const cp1X = x1 + (x2 - x1) * 0.5;
        const cp1Y = y1;
        const cp2X = x2 - (x2 - x1) * 0.5;
        const cp2Y = y2;

        return `M ${x1} ${y1} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x2} ${y2}`;
    };

    useEffect(() => {
        const update = () => {
            if (!centerRef.current || !containerRef.current) return;

            setPaths([
                fatherRef.current ? getPath(centerRef.current, fatherRef.current) : '',
                motherRef.current ? getPath(centerRef.current, motherRef.current) : '',
                brotherRef.current ? getPath(centerRef.current, brotherRef.current) : '',
                sisterRef.current ? getPath(centerRef.current, sisterRef.current) : '',
                partnerRef.current ? getPath(centerRef.current, partnerRef.current) : '',
                sonRef.current ? getPath(centerRef.current, sonRef.current) : '',
                daughterRef.current ? getPath(centerRef.current, daughterRef.current) : '',
            ]);
        };

        // Delay slightly for layout to settle (animations etc)
        const to = setTimeout(update, 50);
        window.addEventListener('resize', update);
        return () => {
            clearTimeout(to);
            window.removeEventListener('resize', update);
        }
    }, [isOpen]); // Recalc when 'isOpen' changes

    const handleSelect = (relationType: 'parent' | 'spouse' | 'child' | 'sibling', gender?: 'male' | 'female') => {
        onOptionSelect(relationType, gender);
        onClose();
    };

    return (
        <div className={`${styles.pickerOverlay} ${isOpen ? styles.open : ''}`}>
            <button className={styles.pickerClose} onClick={onClose}>✕ Close</button>

            <div ref={containerRef} className={styles.pickerContainer}>
                {/* SVG Layer */}
                <svg className={styles.pickerSvg}>
                    {paths.map((d, i) => d ? (
                        <path key={i} d={d} className={styles.connector} />
                    ) : null)}
                </svg>

                {/* Mobile Header */}
                <div className={styles.mobileHeader}>
                    <button className={styles.mobileBack} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <span className={styles.mobileTitle}>Add a relative of {targetMember.first_name}</span>
                </div>

                {/* Center Person */}
                <div ref={centerRef} className={`${styles.pickerCard} ${styles.centerPerson} ${targetMember.gender === 'male' ? styles.maleRole : styles.femaleRole}`}>
                    <div className={styles.pickerAvatar}>
                        {targetMember.first_name[0]}
                    </div>
                    <div className={styles.pickerInfo}>
                        <div className={styles.pickerTitle}>{targetMember.first_name}</div>
                        <div className={styles.pickerSub}>Selected Person</div>
                    </div>
                </div>

                {/* SECTION 1: PARENTS */}
                <div className={styles.pickerSection}>
                    {!existingRelations.hasFather && (
                        <div ref={fatherRef} className={`${styles.pickerCard} ${styles.posFather} ${styles.maleRole}`} onClick={() => handleSelect('parent', 'male')}>
                            <div className={styles.pickerAvatar} style={{ background: '#eef6fc', color: '#4a90e2' }}>+</div>
                            <div className={styles.pickerInfo}>
                                <div className={styles.pickerTitle}>Add Father</div>
                                <div className={styles.pickerSub}>Add Parent</div>
                            </div>
                        </div>
                    )}
                    {!existingRelations.hasMother && (
                        <div ref={motherRef} className={`${styles.pickerCard} ${styles.posMother} ${styles.femaleRole}`} onClick={() => handleSelect('parent', 'female')}>
                            <div className={styles.pickerAvatar} style={{ background: '#fceef6', color: '#e24a8d' }}>+</div>
                            <div className={styles.pickerInfo}>
                                <div className={styles.pickerTitle}>Add Mother</div>
                                <div className={styles.pickerSub}>Add Parent</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 2: PEERS (Partner & Siblings) */}
                <div className={styles.pickerSection}>
                    {!existingRelations.hasSpouse && (
                        <div ref={partnerRef} className={`${styles.pickerCard} ${styles.posPartner} ${styles.neutral}`} onClick={() => handleSelect('spouse')}>
                            <div className={styles.pickerAvatar} style={{ background: '#eee', color: '#888' }}>+</div>
                            <div className={styles.pickerInfo}>
                                <div className={styles.pickerTitle}>Add Partner</div>
                                <div className={styles.pickerSub}>Spouse / Ex</div>
                            </div>
                        </div>
                    )}
                    <div ref={brotherRef} className={`${styles.pickerCard} ${styles.posBrother} ${styles.maleRole}`} onClick={() => handleSelect('sibling', 'male')}>
                        <div className={styles.pickerAvatar} style={{ background: '#eef6fc', color: '#4a90e2' }}>+</div>
                        <div className={styles.pickerInfo}>
                            <div className={styles.pickerTitle}>Add Brother</div>
                            <div className={styles.pickerSub}>Add Sibling</div>
                        </div>
                    </div>
                    <div ref={sisterRef} className={`${styles.pickerCard} ${styles.posSister} ${styles.femaleRole}`} onClick={() => handleSelect('sibling', 'female')}>
                        <div className={styles.pickerAvatar} style={{ background: '#fceef6', color: '#e24a8d' }}>+</div>
                        <div className={styles.pickerInfo}>
                            <div className={styles.pickerTitle}>Add Sister</div>
                            <div className={styles.pickerSub}>Add Sibling</div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: CHILDREN */}
                <div className={styles.pickerSection}>
                    <div ref={sonRef} className={`${styles.pickerCard} ${styles.posSon} ${styles.maleRole}`} onClick={() => handleSelect('child', 'male')}>
                        <div className={styles.pickerAvatar} style={{ background: '#eef6fc', color: '#4a90e2' }}>+</div>
                        <div className={styles.pickerInfo}>
                            <div className={styles.pickerTitle}>Add Son</div>
                            <div className={styles.pickerSub}>Add Child</div>
                        </div>
                    </div>
                    <div ref={daughterRef} className={`${styles.pickerCard} ${styles.posDaughter} ${styles.femaleRole}`} onClick={() => handleSelect('child', 'female')}>
                        <div className={styles.pickerAvatar} style={{ background: '#fceef6', color: '#e24a8d' }}>+</div>
                        <div className={styles.pickerInfo}>
                            <div className={styles.pickerTitle}>Add Daughter</div>
                            <div className={styles.pickerSub}>Add Child</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
