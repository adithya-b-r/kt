import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Plus, RotateCcw, Target, AlertTriangle, Users } from 'lucide-react';
import { FamilyMember, Relationship } from '@/components/hooks/useFamilyTree';
import { MemberCard } from './MemberCard';
import { RelationshipPicker } from './RelationshipPicker';
import { toPng } from 'html-to-image';
import styles from './family-tree.module.css';

// --- LAYOUT CONSTANTS (Matched to inspect.html) ---
const CARD_W = 220;
const CARD_H = 90;
const GAP_H = 40;  // Horizontal gap between siblings/spouses
const GAP_V = 200; // Vertical gap between generations

interface TreeVisualizationProps {
    familyMembers: FamilyMember[];
    relationships: Relationship[];
    selectedMember: FamilyMember | null;
    onSelectMember: (member: FamilyMember) => void;
    onAddMember: (relationType?: 'parent' | 'spouse' | 'child' | 'sibling', relatedTo?: FamilyMember, gender?: 'male' | 'female') => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

interface Position {
    x: number;
    y: number;
}

export interface TreeVisualizationHandle {
    getExportData: (options?: { scale?: number }) => Promise<{ dataUrl: string; width: number; height: number }>;
    focusNode: (memberId: string) => void;
}

export const TreeVisualization = React.forwardRef<TreeVisualizationHandle, TreeVisualizationProps>(({
    familyMembers,
    relationships,
    selectedMember,
    onSelectMember,
    onAddMember,
}, ref) => {
    // ... (omitted unchanging parts) ...


    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Focus State for "Drill Down" (View Family)
    const [focusedRootId, setFocusedRootId] = useState<string | null>(null);
    const [previousRoots, setPreviousRoots] = useState<string[]>([]);

    // Relationship Picker State
    const [pickerTargetId, setPickerTargetId] = useState<string | null>(null);

    // Orphaned Members State
    const [showOrphans, setShowOrphans] = useState(false);

    // --- DATA HELPER MAPS ---
    const { personMap, spouseMap, childrenMap, parentsMap, relationshipMap } = useMemo(() => {
        const personMap = new Map<string, FamilyMember>();
        familyMembers.forEach(m => personMap.set(m.id, m));

        const spouseMap = new Map<string, string[]>();
        const childrenMap = new Map<string, string[]>();
        const parentsMap = new Map<string, string[]>();
        const relationshipMap = new Map<string, Relationship>();

        // Init maps
        familyMembers.forEach(m => {
            spouseMap.set(m.id, []);
            childrenMap.set(m.id, []);
            parentsMap.set(m.id, []);
        });

        relationships.forEach(rel => {
            if (rel.relationship_type === 'spouse') {
                if (spouseMap.has(rel.person1_id)) spouseMap.get(rel.person1_id)!.push(rel.person2_id);
                if (spouseMap.has(rel.person2_id)) spouseMap.get(rel.person2_id)!.push(rel.person1_id);

                // key: minId-maxId
                const key = [rel.person1_id, rel.person2_id].sort().join('-');
                relationshipMap.set(key, rel);

            } else if (rel.relationship_type === 'parent_child') {
                // person1 is parent, person2 is child
                if (childrenMap.has(rel.person1_id)) childrenMap.get(rel.person1_id)!.push(rel.person2_id);
                if (parentsMap.has(rel.person2_id)) parentsMap.get(rel.person2_id)!.push(rel.person1_id);
            }
        });

        return { personMap, spouseMap, childrenMap, parentsMap, relationshipMap };
    }, [familyMembers, relationships]);


    // --- LAYOUT ENGINE (Ported from inspect.html) ---
    const layout = useMemo(() => {
        const positions: Record<string, Position> = {};
        const widths: Record<string, number> = {};
        const visited = new Set<string>();

        if (familyMembers.length === 0) return {};

        // 1. Determine Root
        let rootMember: FamilyMember | undefined;

        if (focusedRootId && personMap.has(focusedRootId)) {
            // Climb up to highest ancestor for context, but keep focusedRootId centrally relevant?
            // "STRICTLY respect the forced root context, but climb to highest ancestor"
            let current = personMap.get(focusedRootId);
            while (current) {
                const pIds = parentsMap.get(current.id) || [];
                if (pIds.length > 0 && personMap.has(pIds[0])) {
                    current = personMap.get(pIds[0]);
                } else {
                    break;
                }
            }
            rootMember = current;
        } else {
            // Priority 1: Explicitly marked Root
            rootMember = familyMembers.find(m => m.is_root);

            // Priority 2: Someone with no parents
            if (!rootMember) {
                rootMember = familyMembers.find(m => {
                    const pIds = parentsMap.get(m.id) || [];
                    return pIds.length === 0;
                });
            }

            // Priority 3: First in list
            if (!rootMember) rootMember = familyMembers[0];
        }

        if (!rootMember) return {};

        // Helper: Calculate Widths (Bottom Up)
        const calculateWidth = (id: string, visitedCalc: Set<string>): number => {
            if (visitedCalc.has(id)) return 0;
            visitedCalc.add(id);

            // Children Width
            let childrenW = 0;

            // Aggregate children from Self AND Spouses
            const myChildren = childrenMap.get(id) || [];
            const spouses = spouseMap.get(id) || [];
            const spouseChildren = spouses.flatMap(sid => childrenMap.get(sid) || []);

            const distinctChildren = [...new Set([...myChildren, ...spouseChildren])];

            // Sort children by birth_date (Oldest first -> Left)
            distinctChildren.sort((aId, bId) => {
                const a = personMap.get(aId);
                const b = personMap.get(bId);
                if (!a || !b) return 0;
                // If birth date missing, push to end
                if (!a.birth_date) return 1;
                if (!b.birth_date) return -1;
                return a.birth_date.localeCompare(b.birth_date);
            });

            if (distinctChildren.length > 0) {
                distinctChildren.forEach(cid => {
                    childrenW += calculateWidth(cid, visitedCalc);
                });
                childrenW += (distinctChildren.length - 1) * GAP_H;
            }

            // Family Base Width (Person + Spouses)
            // We assume primary person + spouses are one block
            const baseW = (1 + spouses.length) * CARD_W + (spouses.length * GAP_H);

            widths[id] = Math.max(childrenW, baseW);
            return widths[id];
        };

        // Helper: Assign Positions (Top Down)
        const assignPos = (id: string, x: number, y: number, visitedPos: Set<string>) => {
            if (visitedPos.has(id)) return;
            visitedPos.add(id);

            const assignedW = widths[id] || CARD_W;
            const spouses = spouseMap.get(id) || [];

            // --- 1. Position The Couple ---
            const unitCount = 1 + spouses.length;
            const totalUnitW = unitCount * CARD_W + (unitCount - 1) * GAP_H;

            // Center the couple within the assigned width space
            const startX = x + (assignedW - totalUnitW) / 2;

            positions[id] = { x: startX, y };

            // Position Spouse(s) to the right
            let currentUnitX = startX + CARD_W + GAP_H;
            spouses.forEach(sid => {
                if (!visitedPos.has(sid)) {
                    positions[sid] = { x: currentUnitX, y };
                    visitedPos.add(sid);
                    currentUnitX += CARD_W + GAP_H;
                }
            });

            // --- 2. Position Children ---
            // Aggregate children from Self AND Spouses
            const myChildren = childrenMap.get(id) || [];
            const spouseChildren = spouses.flatMap(sid => childrenMap.get(sid) || []);
            const distinctChildren = [...new Set([...myChildren, ...spouseChildren])];

            // Sort children by birth_date (Oldest first -> Left)
            // MUST match the order in calculateWidth for correct spacing
            distinctChildren.sort((aId, bId) => {
                const a = personMap.get(aId);
                const b = personMap.get(bId);
                if (!a || !b) return 0;
                if (!a.birth_date) return 1;
                if (!b.birth_date) return -1;
                return a.birth_date.localeCompare(b.birth_date);
            });

            if (distinctChildren.length > 0) {
                // Calculate total width actually needed by children
                let totalChildW = 0;
                distinctChildren.forEach(cid => {
                    totalChildW += widths[cid] || 0;
                });
                totalChildW += (distinctChildren.length - 1) * GAP_H;

                // Start X for first child (Centered under the couple/parent)
                let childX = x + (assignedW - totalChildW) / 2;
                const childY = y + GAP_V;

                distinctChildren.forEach(cid => {
                    assignPos(cid, childX, childY, visitedPos);
                    childX += (widths[cid] || 0) + GAP_H;
                });
            }
        };

        // Run Layout
        // We might have a cycle or issue if we don't define a strict root, but `rootMember` helps.
        // Also need to handle "Calculate Width" with a fresh set each time?
        // Recursive calc might spiral if circular. Prototype used `visited`.
        calculateWidth(rootMember.id, new Set());
        assignPos(rootMember.id, 0, 50, visited);

        return positions;
    }, [familyMembers, focusedRootId, personMap, spouseMap, childrenMap, parentsMap]);

    // --- IDENTIFY ORPHANED MEMBERS ---
    const orphanedMembers = useMemo(() => {
        const visibleIds = new Set(Object.keys(layout));
        if (visibleIds.size === 0 && familyMembers.length > 0) return []; // Initial load or error
        return familyMembers.filter(m => !visibleIds.has(m.id));
    }, [layout, familyMembers]);


    // --- VIEW / ZOOM LOGIC ---
    useEffect(() => {
        // Center view on load or reset
        handleCenter();
    }, [layout]); // re-center when layout changes? Maybe only if empty.

    const handleCenter = useCallback(() => {
        // Simple centering logic
        if (Object.keys(layout).length === 0) return;

        const vals = Object.values(layout);
        const minX = Math.min(...vals.map(p => p.x));
        const maxX = Math.max(...vals.map(p => p.x + CARD_W));
        const minY = Math.min(...vals.map(p => p.y));
        const maxY = Math.max(...vals.map(p => p.y + CARD_H));

        const treeW = maxX - minX;
        const treeH = maxY - minY;

        const contW = containerRef.current?.clientWidth || window.innerWidth;
        const contH = containerRef.current?.clientHeight || window.innerHeight;

        // Custom Mobile/Desktop Zoom Defaults
        const isMobile = window.innerWidth < 768;
        let targetZoom = zoom;

        if (isMobile) {
            // Mobile: Zoom out to see more context
            targetZoom = 0.5;
            setZoom(0.5);
        } else {
            // Desktop: Reset to 100%
            targetZoom = 1;
            setZoom(1);
        }

        const newPanX = (contW - treeW * targetZoom) / 2 - minX * targetZoom;
        const newPanY = (contH - treeH * targetZoom) / 2 - minY * targetZoom;

        setPan({ x: newPanX, y: newPanY }); // Center Vertically too
    }, [layout, zoom]);


    // Handlers for Pan/Zoom
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(`.${styles.node}`) || target.closest('button')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }, [pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    // Wheel Zoom Handler
    const handleWheel = useCallback((e: React.WheelEvent) => {
        const delta = -e.deltaY;
        const scaleFactor = 1.05;

        setZoom(currentZoom => {
            const newZoom = delta > 0 ? currentZoom * scaleFactor : currentZoom / scaleFactor;
            return Math.min(Math.max(newZoom, 0.1), 3);
        });
    }, []);

    // --- TOUCH HANDLING ---
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const touchStartDistanceRef = useRef<number | null>(null);
    const touchStartScaleRef = useRef<number>(1);
    const touchStartMidpointRef = useRef<{ x: number; y: number } | null>(null);
    const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const getDistance = (t1: Touch, t2: Touch) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getMidpoint = (t1: Touch, t2: Touch) => {
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2,
        };
    };

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 1) {
            // Pan
            const touch = e.touches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            lastPanRef.current = { x: pan.x, y: pan.y };
            setIsDragging(true);
        } else if (e.touches.length === 2) {
            // Zoom
            e.preventDefault();
            const dist = getDistance(e.touches[0], e.touches[1]);
            touchStartDistanceRef.current = dist;
            touchStartScaleRef.current = zoom;

            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const mid = getMidpoint(e.touches[0], e.touches[1]);
                // Store midpoint relative to logic if needed, but for simple zoom
                // we mainly need strict scaling. Center-zoom requires pan adjustment.

                // Store midpoint relative to VIZ CONTAINER (for pan adjustment)
                touchStartMidpointRef.current = {
                    x: mid.x - rect.left,
                    y: mid.y - rect.top
                };
                lastPanRef.current = { x: pan.x, y: pan.y };
            }
        }
    }, [pan, zoom]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (e.touches.length === 1 && touchStartRef.current) {
            // Pan
            e.preventDefault(); // Stop scroll
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;

            setPan({
                x: lastPanRef.current.x + deltaX,
                y: lastPanRef.current.y + deltaY
            });
        } else if (e.touches.length === 2 && touchStartDistanceRef.current && touchStartMidpointRef.current) {
            // Zoom
            e.preventDefault();
            const dist = getDistance(e.touches[0], e.touches[1]);
            const scaleFactor = dist / touchStartDistanceRef.current;

            const newZoom = Math.min(Math.max(touchStartScaleRef.current * scaleFactor, 0.1), 3);

            // Adjust Pan to zoom towards midpoint
            // mid relative to container (visual viewport)
            const mid = touchStartMidpointRef.current;
            const oldZoom = touchStartScaleRef.current;

            // Logic: The point under 'mid' should remain under 'mid'
            // worldPoint = (mid - oldPan) / oldZoom
            // mid = worldPoint * newZoom + newPan
            // newPan = mid - worldPoint * newZoom
            // newPan = mid - ((mid - oldPan) / oldZoom) * newZoom

            const oldPan = lastPanRef.current;
            const newPanX = mid.x - ((mid.x - oldPan.x) / oldZoom) * newZoom;
            const newPanY = mid.y - ((mid.y - oldPan.y) / oldZoom) * newZoom;

            setZoom(newZoom);
            setPan({ x: newPanX, y: newPanY });
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        touchStartRef.current = null;
        touchStartDistanceRef.current = null;
    }, []);

    // Attach Touch Listeners (Non-Passive)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);
        // Also cancel/leave
        el.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
            el.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);


    // --- RENDERER HELPER (Elbow Lines) ---
    // Returns SVG Path d attribute
    const drawElbowInfo = (x1: number, y1: number, x2: number, y2: number) => {
        // Elbow style: Vertical down -> Horizontal -> Vertical to target
        const midY = (y1 + y2) / 2;
        return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    };

    // Calculate connection lines
    const connections = useMemo(() => {
        const lines: React.ReactNode[] = [];
        const icons: React.ReactNode[] = [];

        familyMembers.forEach(person => {
            const pos = layout[person.id];
            if (!pos) return;

            // 1. Spouse Lines
            const spouseIds = spouseMap.get(person.id) || [];
            spouseIds.forEach(sid => {
                const sPos = layout[sid];
                if (sPos && sid > person.id) {
                    const y = pos.y + CARD_H / 2;
                    const startX = pos.x + CARD_W;
                    const endX = sPos.x;
                    const midX = (startX + endX) / 2;

                    const relKey = [person.id, sid].sort().join('-');
                    const relData = relationshipMap.get(relKey);
                    const marriageDate = relData?.marriage_date;
                    const divorceDate = relData?.divorce_date;
                    const hasDates = !!marriageDate;

                    // Push Line to 'lines' array
                    lines.push(
                        <g key={`spouse-line-${person.id}-${sid}`}>
                            <title>
                                {marriageDate ? `Married: ${marriageDate}` : 'No Marriage Date'}
                                {divorceDate ? `\nDivorced: ${divorceDate}` : ''}
                            </title>
                            <path
                                d={`M ${startX} ${y} L ${endX} ${y}`}
                                stroke={divorceDate ? "#ef4444" : "#d1d5db"} // Red line if divorced
                                strokeWidth="2"
                                strokeDasharray={divorceDate ? "4 2" : "none"} // Dashed if divorced
                                fill="none"
                            />
                        </g>
                    );

                    // Push Icon to 'icons' array (Renders on top)
                    icons.push(
                        <g key={`spouse-icon-${person.id}-${sid}`} transform={`translate(${midX - 10}, ${y - 10})`} className="cursor-help">
                            {/* Background Circle */}
                            <circle cx="10" cy="10" r="14" fill="white" />
                            <circle cx="10" cy="10" r="12" fill={divorceDate ? "#fee2e2" : (hasDates ? "#FEF3C7" : "#fee2e2")} stroke={divorceDate ? "#ef4444" : (hasDates ? "#F59E0B" : "#ef4444")} strokeWidth="1.5" />

                            {divorceDate ? (
                                // Divorced: Broken/Separated Rings
                                <g transform="translate(4, 6) scale(0.6)">
                                    <path d="M5,8 A5,5 0 1,0 10,13 M9,3 L15,13" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                                    <path d="M13,3 A5,5 0 1,1 18,8" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                                </g>
                            ) : !hasDates ? (
                                // Pending Date: Warning Exclamation
                                <text x="10" y="16" textAnchor="middle" fontSize="14" fill="#ef4444" fontWeight="bold">!</text>
                            ) : (
                                // Married: Interlocking Rings
                                <g transform="translate(4, 6) scale(0.6)">
                                    <circle cx="8" cy="8" r="7" fill="none" stroke="#D97706" strokeWidth="2.5" />
                                    <circle cx="15" cy="8" r="7" fill="none" stroke="#D97706" strokeWidth="2.5" />
                                </g>
                            )}
                        </g>
                    );
                }
            });

            // 2. Parent -> Child Lines
            // Logic Update: Draw line if I am the "Primary" parent logic for this node relative to the couple.
            // We want ONE line coming from the couple (or single parent) to the children.
            // If there are spouses, we pick one person (e.g. the one with smaller ID or just checking if I've handled this couple) to draw the line.

            // Check if I have a spouse.
            const spouses = spouseMap.get(person.id) || [];
            let shouldDrawChildren = false;

            if (spouses.length === 0) {
                // Single parent -> Always draw
                shouldDrawChildren = true;
            } else {
                // Couple -> Draw only if I am the "first" in the relationship (e.g. Male, or alphabetically first if same gender) to avoid double lines
                // Simplest: If I am Male, draw. If both Female/Male, Male draws.
                // If I am Female and spouse is Male, I don't draw.
                // If same gender, use ID comparison.

                const spouseId = spouses[0]; // simplistic for 1 spouse
                const spouse = personMap.get(spouseId);

                if (person.gender === 'male' && spouse?.gender !== 'male') {
                    shouldDrawChildren = true;
                } else if (person.gender === spouse?.gender) {
                    // Tie-breaker
                    shouldDrawChildren = person.id < spouseId;
                } else if (person.gender !== 'male' && spouse?.gender === 'male') {
                    shouldDrawChildren = false;
                } else {
                    // Default fallback
                    shouldDrawChildren = true;
                }
            }

            if (shouldDrawChildren) {
                // Collect children from Self AND from Spouses
                const myChildren = childrenMap.get(person.id) || [];

                const spouseChildren = spouses.flatMap(sid => childrenMap.get(sid) || []);

                // Merge and dedup
                const allChildren = [...new Set([...myChildren, ...spouseChildren])];

                if (allChildren.length > 0) {
                    let startX = pos.x + CARD_W / 2;
                    let startY = pos.y + CARD_H;

                    // Adjust start point if spouse exists (use first spouse found that is visible)
                    if (spouses.length > 0) {
                        const visibleSpouseId = spouses.find(sid => layout[sid]);
                        if (visibleSpouseId) {
                            const sPos = layout[visibleSpouseId];
                            startX = (pos.x + sPos.x + CARD_W) / 2; // Midpoint of couple
                            startY = pos.y + CARD_H / 2; // From the connecting line (middle height)
                        }
                    }

                    allChildren.forEach(cid => {
                        const cPos = layout[cid];
                        if (cPos) {
                            lines.push(
                                <path
                                    key={`child-${person.id}-${cid}`}
                                    d={drawElbowInfo(startX, startY, cPos.x + CARD_W / 2, cPos.y)}
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            );
                        }
                    });
                }
            }
        });

        return [...lines, ...icons];
    }, [layout, familyMembers, spouseMap, childrenMap, personMap, relationshipMap]);


    const handleFocus = (id: string) => {
        if (focusedRootId === id) return;
        setPreviousRoots(prev => [...prev, focusedRootId || 'default']);
        setFocusedRootId(id);
    };

    const handleBack = () => {
        const newHistory = [...previousRoots];
        const last = newHistory.pop();
        setPreviousRoots(newHistory);
        setFocusedRootId(last === 'default' ? null : last || null);
    };

    // --- AUTO-RECENTER ON RESIZE (Mobile Switch) ---
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Trigger auto-focus on the current view's root
                if (focusedRootId) {
                    handleFocus(focusedRootId); // Re-trigger focus logic
                    // Or access the ref to call internal handle.focusNode if needed, 
                    // but we do not have easy access to the imperative handle inside.
                    // Instead, we can reuse the logic from `focusNode` exposed via generic function or just rely on `handleCenter` if zoom/pan is reset.

                    // Actually, `handleCenter` centers the WHOLE tree. 
                    // If we are "focused" on a node (drill down), we want to stay there?
                    // But `handleCenter` seems to be the default "reset view" behavior.
                    // Let's try to intelligently centers the CURRENT root node if set, else the whole tree.

                    if (personMap.has(focusedRootId)) {
                        // We need to call the logic that `focusNode` uses.
                        // Since `focusNode` is defined in `useImperativeHandle` below, we can't call it directly here easily 
                        // unless we extract the logic. 
                        // However, we CAN just call `handleCenter()` which centers everything, 
                        // OR we can rely on the existing effect [layout] which calls handleCenter().

                        // But resize doesn't change layout structure, just container size.
                        // So `handleCenter` is valid.
                        // Let's just re-run handleCenter which adapts to container size.
                        handleCenter();
                    }
                } else {
                    // No specific focus, just center the graph
                    handleCenter();
                }
            }, 200); // Debounce 200ms
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [focusedRootId, handleCenter, personMap]);

    // --- EXPORT HANDLE ---
    React.useImperativeHandle(ref, () => ({
        getExportData: async (options) => {
            if (!contentRef.current) throw new Error('Tree content not found');

            // 1. Calculate Bounding Box
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            const vals = Object.values(layout);

            if (vals.length === 0) {
                minX = 0; maxX = 800; minY = 0; maxY = 600;
            } else {
                vals.forEach(p => {
                    if (p.x < minX) minX = p.x;
                    if (p.x + CARD_W > maxX) maxX = p.x + CARD_W;
                    if (p.y < minY) minY = p.y;
                    if (p.y + CARD_H > maxY) maxY = p.y + CARD_H;
                });
            }

            const PADDING = 100;
            const fullWidth = (maxX - minX) + (PADDING * 2);
            const fullHeight = (maxY - minY) + (PADDING * 2);
            const exportScale = options?.scale || 1.0;

            // Preserve SVG State
            const svgEl = contentRef.current.querySelector('svg');
            const originalSvgWidth = svgEl?.getAttribute('width');
            const originalSvgHeight = svgEl?.getAttribute('height');

            // Preserve Parent Overflow (Card) to prevent clipping during capture
            const parentEl = containerRef.current?.parentElement;
            const originalParentOverflow = parentEl ? parentEl.style.overflow : '';

            // 3. Apply Temporary Styles for Full Visibility (Only minimum necessary on real DOM)
            // Unlock parent to allow full expansion
            if (parentEl) parentEl.style.overflow = 'visible';

            // Resize SVG on real DOM (Minimally visible, ensures connectors render)
            if (svgEl) {
                svgEl.setAttribute('width', `${fullWidth}`);
                svgEl.setAttribute('height', `${fullHeight}`);
            }

            try {
                // Wait for repaint/reflow to ensure SVG resize is applied
                await new Promise(resolve => setTimeout(resolve, 100));

                // 4. Capture
                const dataUrl = await toPng(contentRef.current, {
                    backgroundColor: '#F5F5F5',
                    width: fullWidth * exportScale,
                    height: fullHeight * exportScale,
                    style: {
                        // Override styles on the CLONE to avoid "moving" the real tree
                        transform: `translate(${-minX + PADDING}px, ${-minY + PADDING}px) scale(${exportScale})`,
                        transformOrigin: 'top left',
                        width: `${fullWidth}px`,
                        height: `${fullHeight}px`,
                        transition: 'none', // Ensure check for transition
                        overflow: 'visible'
                    },
                    // Ensure fonts and images are fully loaded
                    cacheBust: true,
                });

                return {
                    dataUrl,
                    width: fullWidth * exportScale,
                    height: fullHeight * exportScale
                };
            } finally {
                // 5. Restore Original State
                if (svgEl) {
                    if (originalSvgWidth) svgEl.setAttribute('width', originalSvgWidth);
                    if (originalSvgHeight) svgEl.setAttribute('height', originalSvgHeight);
                }
                if (parentEl) {
                    parentEl.style.overflow = originalParentOverflow;
                }
            }
        },
        focusNode: (memberId: string) => {
            const pos = layout[memberId];
            if (!pos) return;

            const contW = containerRef.current?.clientWidth || window.innerWidth;
            const contH = containerRef.current?.clientHeight || window.innerHeight;

            // Target zoom level
            const targetZoom = 1;

            // Center the node
            // Formula: Center = (BoxSize - NodeSize*Zoom) / 2 - NodePos*Zoom
            // We want node center at screen center
            // Node Center X relative to canvas = pos.x + CARD_W/2
            // Node Center Y relative to canvas = pos.y + CARD_H/2

            const nodeCenterX = pos.x + CARD_W / 2;
            const nodeCenterY = pos.y + CARD_H / 2;

            const newPanX = (contW / 2) - (nodeCenterX * targetZoom);
            const newPanY = (contH / 2) - (nodeCenterY * targetZoom);

            setZoom(targetZoom);
            setPan({ x: newPanX, y: newPanY });
        }
    }));


    // Handle Picker Selection
    const handlePickerSelect = (relationType: 'parent' | 'spouse' | 'child' | 'sibling', gender?: 'male' | 'female') => {
        if (!pickerTargetId) return;
        const targetMember = personMap.get(pickerTargetId);
        if (!targetMember) return;

        if (relationType === 'sibling') {
            // Find parent of target
            const pIds = parentsMap.get(targetMember.id) || [];
            if (pIds.length > 0) {
                const parent = personMap.get(pIds[0]);
                onAddMember('child', parent, gender);
            } else {
                alert("Cannot add sibling to a root node without parents. Add a parent first.");
            }
        } else {
            onAddMember(relationType, targetMember, gender);
        }
        setPickerTargetId(null);
    };

    return (
        <Card className="h-[calc(100vh-140px)] relative overflow-hidden border border-gray-200 shadow-sm bg-[#f5f7fa]">
            {/* Relationship Picker Overlay */}
            {pickerTargetId && personMap.get(pickerTargetId) && (
                <RelationshipPicker
                    targetMember={personMap.get(pickerTargetId)!}
                    onClose={() => setPickerTargetId(null)}
                    onOptionSelect={handlePickerSelect}
                    existingRelations={{
                        hasFather: !!parentsMap.get(pickerTargetId!)?.some(pid => personMap.get(pid)?.gender === 'male'),
                        hasMother: !!parentsMap.get(pickerTargetId!)?.some(pid => personMap.get(pid)?.gender === 'female'),
                        hasSpouse: (spouseMap.get(pickerTargetId!)?.length || 0) > 0,
                    }}
                />
            )}

            {/* Orphaned Members Indicator */}
            {orphanedMembers.length > 0 && (
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="shadow-md gap-2"
                        onClick={() => setShowOrphans(!showOrphans)}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        {orphanedMembers.length} Unconnected
                    </Button>

                    {showOrphans && (
                        <Card className="p-3 w-64 shadow-xl border-red-100 bg-white/95 backdrop-blur animate-in fade-in slide-in-from-top-2">
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                Disconnected Members
                            </div>
                            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                                {orphanedMembers.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            handleFocus(m.id);
                                            setShowOrphans(false);
                                        }}
                                        className="text-left text-sm p-2 hover:bg-slate-100 rounded flex items-center gap-2 group transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 shrink-0 overflow-hidden">
                                            {m.photo_url ? (
                                                <img src={m.photo_url} alt={m.first_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="h-3 w-3" />
                                            )}
                                        </div>
                                        <span className="truncate flex-1 group-hover:text-blue-600">
                                            {m.first_name} {m.last_name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                                Click a member to view their tree
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Unified Toolbar (Top Left) */}
            <div className="absolute top-5 left-5 z-20 flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                {/* Zoom Out */}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={() => setZoom(z => Math.max(z * 0.8, 0.1))}>
                    <ZoomOut size={16} />
                </Button>

                {/* Zoom Level Text */}
                <span className="text-xs font-medium text-gray-600 min-w-[40px] text-center">
                    {Math.round(zoom * 100)}%
                </span>

                {/* Zoom In */}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={() => setZoom(z => Math.min(z * 1.2, 3))}>
                    <ZoomIn size={16} />
                </Button>

                <div className="h-4 w-px bg-gray-300 mx-1" /> {/* Divider */}

                {/* Reset View */}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={handleCenter} title="Reset View">
                    <RotateCcw size={16} />
                </Button>

                {/* Focus/Center (Maybe "Fit to Screen" or just center) */}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" onClick={handleCenter} title="Re-center">
                    <Target size={16} />
                </Button>


            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing relative"
                style={{ touchAction: 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel} // Added Wheel Handler
            >
                <div
                    ref={contentRef}
                    className="absolute top-0 left-0 transition-transform duration-75 origin-top-left"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                    }}
                >
                    {/* SVG Layer */}
                    <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" width="1" height="1">
                        {connections}
                    </svg>

                    {/* Nodes Layer */}
                    {Object.entries(layout).map(([id, pos]) => {
                        const member = personMap.get(id);
                        if (!member) return null;

                        // Logic for Hidden Family (Dumbbell)
                        // 1. Hidden Parents: if father/mother exists but not in `layout`
                        // 2. Hidden Children: if child exists but not in `layout`
                        let hasHidden = false;
                        const pIds = parentsMap.get(id) || [];
                        if (pIds.some(pid => !layout[pid])) hasHidden = true;

                        const cIds = childrenMap.get(id) || [];
                        if (cIds.some(cid => !layout[cid])) hasHidden = true;

                        return (
                            <div
                                key={id}
                                style={{
                                    position: 'absolute',
                                    left: pos.x,
                                    top: pos.y
                                }}
                            >
                                <MemberCard
                                    member={member}
                                    isRoot={id === focusedRootId}
                                    hasHiddenFamily={hasHidden && id !== focusedRootId} // Don't show if already focused
                                    onClick={() => onSelectMember(member)}
                                    // Actions
                                    onAddSpouse={() => onAddMember('spouse', member)}
                                    onAddChild={() => setPickerTargetId(id)}
                                    onNodeDelete={() => {
                                        // We don't have a direct delete prop, but we can hook it up if we expose it
                                        // For now, selecting brings up details which has delete.
                                        onSelectMember(member);
                                    }}
                                    onViewFamily={() => handleFocus(id)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card >
    );
});

TreeVisualization.displayName = 'TreeVisualization';
