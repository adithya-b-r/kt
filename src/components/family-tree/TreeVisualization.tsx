import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Users, Move, Crosshair } from 'lucide-react';
import { FamilyMember, Relationship } from '@/components/hooks/useFamilyTree';
import { MemberCard } from './MemberCard';

interface TreeVisualizationProps {
    familyMembers: FamilyMember[];
    relationships: Relationship[];
    selectedMember: FamilyMember | null;
    onSelectMember: (member: FamilyMember) => void;
    onAddMember: (relationType?: 'parent' | 'spouse' | 'child', relatedTo?: FamilyMember) => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

interface PositionedMember {
    member: FamilyMember;
    x: number;
    y: number;
    hasParents: boolean;
    hasSpouse: boolean;
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 140;
const H_GAP = 30;
const V_GAP = 80;
const SPOUSE_GAP = 50;

import { toPng } from 'html-to-image';

export interface TreeVisualizationHandle {
    getExportData: (options?: { scale?: number }) => Promise<{ dataUrl: string; width: number; height: number }>;
}

export const TreeVisualization = React.forwardRef<TreeVisualizationHandle, TreeVisualizationProps>(({
    familyMembers,
    relationships,
    selectedMember,
    onSelectMember,
    onAddMember,
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Build relationship maps
    const { spouseMap, childrenMap, parentsMap } = useMemo(() => {
        const spouseMap = new Map<string, string>(); // person -> first spouse (MVP: one spouse)
        const childrenMap = new Map<string, Set<string>>(); // parent -> children
        const parentsMap = new Map<string, Set<string>>(); // child -> parents

        relationships.forEach(rel => {
            if (rel.relationship_type === 'spouse') {
                // MVP: Only track first spouse
                if (!spouseMap.has(rel.person1_id)) {
                    spouseMap.set(rel.person1_id, rel.person2_id);
                }
                if (!spouseMap.has(rel.person2_id)) {
                    spouseMap.set(rel.person2_id, rel.person1_id);
                }
            } else if (rel.relationship_type === 'parent_child') {
                if (!childrenMap.has(rel.person1_id)) {
                    childrenMap.set(rel.person1_id, new Set());
                }
                childrenMap.get(rel.person1_id)!.add(rel.person2_id);

                if (!parentsMap.has(rel.person2_id)) {
                    parentsMap.set(rel.person2_id, new Set());
                }
                parentsMap.get(rel.person2_id)!.add(rel.person1_id);
            }
        });

        return { spouseMap, childrenMap, parentsMap };
    }, [relationships]);

    // Get children that belong to a parent pair, sorted by birth date (oldest first)
    // MVP: Show children linked to EITHER parent in the couple, but avoid duplicates
    const getChildrenOfCouple = useCallback((personId: string, spouseId: string | undefined): string[] => {
        const personChildren = childrenMap.get(personId) || new Set<string>();
        const spouseChildren = spouseId ? (childrenMap.get(spouseId) || new Set<string>()) : new Set<string>();

        // Combine children from both parents (union)
        const coupleChildrenSet = new Set<string>();
        personChildren.forEach(c => coupleChildrenSet.add(c));
        spouseChildren.forEach(c => coupleChildrenSet.add(c));

        // Filter: only include children whose parents are EXACTLY this couple
        // (to prevent showing children from other marriages)
        const coupleChildren: string[] = [];
        coupleChildrenSet.forEach(childId => {
            const childParents = parentsMap.get(childId);
            if (!childParents) return;

            const parentIds = Array.from(childParents);

            // Check if child belongs to this couple:
            // - Child has this person as a parent AND
            // - Child has NO other parent OR child's other parent is the spouse
            const hasThisPerson = parentIds.includes(personId);
            const hasSpouse = spouseId ? parentIds.includes(spouseId) : false;
            const otherParents = parentIds.filter(p => p !== personId && p !== spouseId);

            if (hasThisPerson || hasSpouse) {
                // Only include if child doesn't have parents from a different marriage
                if (otherParents.length === 0) {
                    coupleChildren.push(childId);
                }
            }
        });

        // Sort by birth date (oldest first = left, youngest last = right)
        coupleChildren.sort((a, b) => {
            const memberA = familyMembers.find(m => m.id === a);
            const memberB = familyMembers.find(m => m.id === b);

            const dateA = memberA?.birth_date ? new Date(memberA.birth_date).getTime() : Infinity;
            const dateB = memberB?.birth_date ? new Date(memberB.birth_date).getTime() : Infinity;

            // If no birth date, sort alphabetically by first name as fallback
            if (dateA === Infinity && dateB === Infinity) {
                const nameA = memberA?.first_name || '';
                const nameB = memberB?.first_name || '';
                return nameA.localeCompare(nameB);
            }

            return dateA - dateB;
        });

        return coupleChildren;
    }, [childrenMap, parentsMap, familyMembers]);

    // Find the topmost ancestor (the real root of the tree)
    const findTopmostAncestor = useCallback((startId: string, visited: Set<string>): string => {
        if (visited.has(startId)) return startId;
        visited.add(startId);

        const parents = parentsMap.get(startId);
        if (!parents || parents.size === 0) {
            return startId;
        }

        const firstParent = Array.from(parents)[0];
        return findTopmostAncestor(firstParent, visited);
    }, [parentsMap]);

    // Calculate positioned members
    const positionedMembers = useMemo((): PositionedMember[] => {
        if (familyMembers.length === 0) return [];

        const positioned: PositionedMember[] = [];
        const visited = new Set<string>();
        const memberIds = new Set(familyMembers.map(m => m.id));

        // Calculate generation level by traversing UP to ancestors
        const getGenerationLevel = (memberId: string, seen: Set<string>): number => {
            if (seen.has(memberId)) return 0;
            seen.add(memberId);

            const parents = parentsMap.get(memberId);
            const validParents = parents ? Array.from(parents).filter(p => memberIds.has(p)) : [];

            if (validParents.length === 0) {
                // Check if spouse has parents
                const spouseId = spouseMap.get(memberId);
                if (spouseId && !seen.has(spouseId) && memberIds.has(spouseId)) {
                    const spouseParents = parentsMap.get(spouseId);
                    const validSpouseParents = spouseParents ? Array.from(spouseParents).filter(p => memberIds.has(p)) : [];
                    if (validSpouseParents.length > 0) {
                        return getGenerationLevel(validSpouseParents[0], new Set(seen)) + 1;
                    }
                }
                return 0;
            }

            return getGenerationLevel(validParents[0], new Set(seen)) + 1;
        };

        // Calculate generations for all members
        const generations = new Map<string, number>();
        familyMembers.forEach(member => {
            generations.set(member.id, getGenerationLevel(member.id, new Set()));
        });

        // Group members by generation
        const generationGroups = new Map<number, string[]>();
        generations.forEach((gen, memberId) => {
            if (!generationGroups.has(gen)) {
                generationGroups.set(gen, []);
            }
            generationGroups.get(gen)!.push(memberId);
        });

        // Find all root ancestors (generation 0)
        const rootAncestors = generationGroups.get(0) || [];

        // Calculate subtree width
        const calculateSubtreeWidth = (personId: string, visitedCalc: Set<string>): number => {
            if (visitedCalc.has(personId) || !memberIds.has(personId)) return 0;
            visitedCalc.add(personId);

            const spouseId = spouseMap.get(personId);
            const hasSpouse = spouseId && memberIds.has(spouseId);
            if (hasSpouse && !visitedCalc.has(spouseId)) visitedCalc.add(spouseId);

            const children = getChildrenOfCouple(personId, spouseId).filter(c => memberIds.has(c));
            const unvisitedChildren = children.filter(c => !visitedCalc.has(c));

            if (unvisitedChildren.length === 0) {
                return CARD_WIDTH + (hasSpouse && !visited.has(spouseId) ? CARD_WIDTH + SPOUSE_GAP : 0);
            }

            let totalChildWidth = 0;
            unvisitedChildren.forEach((childId, idx) => {
                totalChildWidth += calculateSubtreeWidth(childId, new Set(visitedCalc));
                if (idx < unvisitedChildren.length - 1) {
                    totalChildWidth += H_GAP;
                }
            });

            const parentWidth = CARD_WIDTH + (hasSpouse ? CARD_WIDTH + SPOUSE_GAP : 0);
            return Math.max(parentWidth, totalChildWidth);
        };

        // Position a single person and their descendants
        const positionPerson = (personId: string, startX: number, y: number): number => {
            if (visited.has(personId) || !memberIds.has(personId)) return startX;

            const member = familyMembers.find(m => m.id === personId);
            if (!member) return startX;

            visited.add(personId);

            const spouseId = spouseMap.get(personId);
            const spouse = spouseId && memberIds.has(spouseId) ? familyMembers.find(m => m.id === spouseId) : null;
            const spouseAlreadyVisited = spouse && visited.has(spouseId!);

            if (spouse && !spouseAlreadyVisited) {
                visited.add(spouseId!);
            }

            const children = getChildrenOfCouple(personId, spouseId).filter(c => memberIds.has(c));
            const unvisitedChildren = children.filter(c => !visited.has(c));

            // Calculate total width needed for children
            let totalChildrenWidth = 0;
            const childWidths: number[] = [];

            unvisitedChildren.forEach((childId, idx) => {
                const width = calculateSubtreeWidth(childId, new Set(visited));
                childWidths.push(width);
                totalChildrenWidth += width;
                if (idx < unvisitedChildren.length - 1) {
                    totalChildrenWidth += H_GAP;
                }
            });

            const hasUnvisitedSpouse = spouse && !spouseAlreadyVisited;
            const parentUnitWidth = CARD_WIDTH + (hasUnvisitedSpouse ? CARD_WIDTH + SPOUSE_GAP : 0);
            const subtreeWidth = Math.max(parentUnitWidth, totalChildrenWidth);
            const parentStartX = startX + (subtreeWidth - parentUnitWidth) / 2;

            positioned.push({
                member,
                x: parentStartX,
                y,
                hasParents: (parentsMap.get(personId)?.size || 0) > 0,
                hasSpouse: !!spouse,
            });

            if (hasUnvisitedSpouse) {
                const spouseX = parentStartX + CARD_WIDTH + SPOUSE_GAP;
                positioned.push({
                    member: spouse,
                    x: spouseX,
                    y,
                    hasParents: (parentsMap.get(spouseId!)?.size || 0) > 0,
                    hasSpouse: true,
                });
            }

            // Position children below
            if (unvisitedChildren.length > 0) {
                const childrenStartX = startX + (subtreeWidth - totalChildrenWidth) / 2;
                let currentX = childrenStartX;

                unvisitedChildren.forEach((childId, idx) => {
                    positionPerson(childId, currentX, y + CARD_HEIGHT + V_GAP);
                    currentX += childWidths[idx] + H_GAP;
                });
            }

            return startX + subtreeWidth;
        };

        // Position all root ancestors at the top
        let currentX = 100;
        rootAncestors.forEach(rootId => {
            if (!visited.has(rootId)) {
                const width = calculateSubtreeWidth(rootId, new Set());
                positionPerson(rootId, currentX, 120);
                currentX += width + H_GAP * 2;
            }
        });

        // Position any remaining unvisited members
        const maxY = positioned.length > 0 ? Math.max(...positioned.map(p => p.y)) : 60;

        familyMembers.forEach(member => {
            if (!visited.has(member.id)) {
                positioned.push({
                    member,
                    x: currentX,
                    y: maxY + CARD_HEIGHT + V_GAP + 50,
                    hasParents: false,
                    hasSpouse: false,
                });
                currentX += CARD_WIDTH + H_GAP;
                visited.add(member.id);
            }
        });

        return positioned;
    }, [familyMembers, spouseMap, parentsMap, getChildrenOfCouple]);

    // Calculate connection lines
    const connectionElements = useMemo(() => {
        const elements: React.JSX.Element[] = [];
        const memberPositions = new Map(positionedMembers.map(pm => [pm.member.id, pm]));
        const processedSpouses = new Set<string>();
        const processedChildren = new Set<string>();

        // Draw spouse connections and grouped parent-child lines for couples
        relationships.forEach((rel, idx) => {
            if (rel.relationship_type !== 'spouse') return;

            const key = [rel.person1_id, rel.person2_id].sort().join('-');
            if (processedSpouses.has(key)) return;
            processedSpouses.add(key);

            const person1 = memberPositions.get(rel.person1_id);
            const person2 = memberPositions.get(rel.person2_id);
            if (!person1 || !person2) return;

            const leftPerson = person1.x < person2.x ? person1 : person2;
            const rightPerson = person1.x < person2.x ? person2 : person1;

            const x1 = leftPerson.x + CARD_WIDTH;
            const y1 = leftPerson.y + CARD_HEIGHT / 2;
            const x2 = rightPerson.x;
            const y2 = rightPerson.y + CARD_HEIGHT / 2;
            const midX = (x1 + x2) / 2;

            elements.push(
                <g key={`spouse-${idx}`}>
                    <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                    <circle
                        cx={midX}
                        cy={y1}
                        r={12}
                        fill="#fef3c7"
                        stroke="#f59e0b"
                        strokeWidth={2}
                    />
                    <circle
                        cx={midX - 3}
                        cy={y1}
                        r={5}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                    />
                    <circle
                        cx={midX + 3}
                        cy={y1}
                        r={5}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                    />
                </g>
            );

            // Group children under this couple
            const children = getChildrenOfCouple(rel.person1_id, rel.person2_id)
                .map(childId => memberPositions.get(childId))
                .filter((child): child is PositionedMember => !!child);

            if (children.length > 0) {
                const parentMidX = leftPerson.x + CARD_WIDTH + SPOUSE_GAP / 2;
                const parentY = leftPerson.y + CARD_HEIGHT;
                const childCenters = children.map(child => child.x + CARD_WIDTH / 2).sort((a, b) => a - b);
                const childY = Math.min(...children.map(child => child.y));
                const midY = parentY + (childY - parentY) / 2;

                elements.push(
                    <g key={`couple-${key}`}>
                        <line
                            x1={parentMidX}
                            y1={parentY}
                            x2={parentMidX}
                            y2={midY}
                            stroke="#9ca3af"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                        <line
                            x1={childCenters[0]}
                            y1={midY}
                            x2={childCenters[childCenters.length - 1]}
                            y2={midY}
                            stroke="#9ca3af"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                        {children.map(child => (
                            <line
                                key={`child-${child.member.id}`}
                                x1={child.x + CARD_WIDTH / 2}
                                y1={midY}
                                x2={child.x + CARD_WIDTH / 2}
                                y2={child.y}
                                stroke="#9ca3af"
                                strokeWidth={2}
                                strokeLinecap="round"
                            />
                        ))}
                    </g>
                );

                children.forEach(child => processedChildren.add(child.member.id));
            }
        });

        // Draw remaining parent-child lines for single-parent cases
        relationships.forEach((rel, idx) => {
            if (rel.relationship_type !== 'parent_child') return;
            if (processedChildren.has(rel.person2_id)) return;

            const parent = memberPositions.get(rel.person1_id);
            const child = memberPositions.get(rel.person2_id);
            if (!parent || !child) return;

            const parentX = parent.x + CARD_WIDTH / 2;
            const parentY = parent.y + CARD_HEIGHT;
            const childX = child.x + CARD_WIDTH / 2;
            const childY = child.y;
            const midY = parentY + (childY - parentY) / 2;

            elements.push(
                <g key={`parent-${idx}`}>
                    <line
                        x1={parentX}
                        y1={parentY}
                        x2={parentX}
                        y2={midY}
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                    <line
                        x1={parentX}
                        y1={midY}
                        x2={childX}
                        y2={midY}
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                    <line
                        x1={childX}
                        y1={midY}
                        x2={childX}
                        y2={childY}
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                </g>
            );
        });

        return elements;
    }, [positionedMembers, relationships, getChildrenOfCouple]);

    // Handle Export logic exposed via ref
    React.useImperativeHandle(ref, () => ({
        getExportData: async (options) => {
            if (!contentRef.current) throw new Error('Tree content not found');

            // 1. Calculate bounding box of the entire tree
            if (positionedMembers.length === 0) {
                return { dataUrl: '', width: 0, height: 0 };
            }

            const minX = Math.min(...positionedMembers.map(pm => pm.x));
            const maxX = Math.max(...positionedMembers.map(pm => pm.x + CARD_WIDTH));
            const minY = Math.min(...positionedMembers.map(pm => pm.y));
            const maxY = Math.max(...positionedMembers.map(pm => pm.y + CARD_HEIGHT));

            const PADDING = 50;
            const SCALE = options?.scale || 1; // Default to 1 if not specified
            const width = (maxX - minX) * SCALE + (PADDING * 2);
            const height = (maxY - minY) * SCALE + (PADDING * 2);

            // 2. Generate the image with specific style overrides to force centering and full size
            // We use matrix transform to reliably scale and translate: x' = x*S + tx
            // tx = PADDING - minX * S
            const tx = PADDING - minX * SCALE;
            const ty = PADDING - minY * SCALE;

            const dataUrl = await toPng(contentRef.current, {
                quality: 0.95,
                backgroundColor: '#F5F2E9',
                width: width,
                height: height,
                pixelRatio: 3, // Higher pixel ratio for better clarity
                style: {
                    // Ignore current zoom/pan transform and apply export scale
                    transform: `matrix(${SCALE}, 0, 0, ${SCALE}, ${tx}, ${ty})`,
                    transformOrigin: 'top left',
                    width: `${width}px`,
                    height: `${height}px`,
                }
            });

            return { dataUrl, width, height };
        }
    }));

    // Pan handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-member-card]') || target.closest('button')) return;

        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }, [pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-member-card]') || target.closest('button')) return;
        if (!e.touches.length) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }, [pan]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isDragging && e.touches.length) {
            const touch = e.touches[0];
            setPan({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev * 0.8, 0.5));
    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Center the tree based on positioned members
    const handleCenter = useCallback(() => {
        if (positionedMembers.length === 0) return;

        const minX = Math.min(...positionedMembers.map(pm => pm.x));
        const maxX = Math.max(...positionedMembers.map(pm => pm.x + CARD_WIDTH));
        const minY = Math.min(...positionedMembers.map(pm => pm.y));
        const maxY = Math.max(...positionedMembers.map(pm => pm.y + CARD_HEIGHT));

        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;

        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;

        // Calculate center position
        const centerX = (containerWidth - treeWidth * zoom) / 2 - minX * zoom;
        const centerY = (containerHeight - treeHeight * zoom) / 2 - minY * zoom;

        setPan({ x: centerX, y: centerY });
    }, [positionedMembers, zoom]);

    return (
        <Card className="h-175 relative overflow-hidden border-2 border-border/50 shadow-lg">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-1 bg-card/95 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-border/50">
                <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-8 w-8 p-0 hover:bg-muted">
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-semibold min-w-11.25 text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-8 w-8 p-0 hover:bg-muted">
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 w-8 p-0 hover:bg-muted">
                    <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCenter} className="h-8 w-8 p-0 hover:bg-muted" title="Center Tree">
                    <Crosshair className="h-4 w-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button size="sm" onClick={() => onAddMember()} className="h-8 px-3 gap-1.5 font-medium">
                    <Plus className="h-4 w-4" />
                    Add Member
                </Button>
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-4 z-30 text-xs text-muted-foreground bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 shadow border border-border/30">
                <Move className="h-3.5 w-3.5" />
                <span>Drag or swipe to pan • Hover cards for quick actions</span>
            </div>

            {/* Canvas */}
            <CardContent
                ref={containerRef}
                className="p-0 h-full cursor-grab active:cursor-grabbing relative overflow-hidden touch-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.3) 0%, #ffffff 50%, rgba(243, 244, 246, 0.2) 100%)',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                {familyMembers.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-xl max-w-md mx-4">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Start Your Family Tree</h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Begin building your family heritage by adding your first family member
                            </p>
                            <Button onClick={() => onAddMember()} size="lg" className="gap-2 px-6">
                                <Plus className="h-5 w-5" />
                                Add First Member
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        ref={contentRef}
                        className="absolute inset-0"
                        style={{
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            transformOrigin: 'center center',
                        }}
                    >
                        {/* Connection Lines */}
                        <svg className="absolute inset-0 pointer-events-none" style={{ width: '4000px', height: '3000px' }}>
                            {connectionElements}
                        </svg>

                        {/* Member Cards */}
                        {positionedMembers.map((pm) => (
                            <div
                                key={pm.member.id}
                                data-member-card
                                className="absolute transition-transform duration-200"
                                style={{
                                    left: pm.x,
                                    top: pm.y,
                                }}
                            >
                                <MemberCard
                                    member={pm.member}
                                    isSelected={selectedMember?.id === pm.member.id}
                                    isRoot={pm.member.is_root}
                                    onClick={() => onSelectMember(pm.member)}
                                    onAddParent={pm.member.is_root ? undefined : () => onAddMember('parent', pm.member)}
                                    onAddSpouse={pm.hasSpouse ? undefined : () => onAddMember('spouse', pm.member)}
                                    onAddChild={() => onAddMember('child', pm.member)}
                                    hasParents={pm.hasParents}
                                    hasSpouse={pm.hasSpouse}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

TreeVisualization.displayName = 'TreeVisualization';
