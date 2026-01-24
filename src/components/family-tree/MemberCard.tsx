import React from 'react';
import { Plus, User, Heart, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FamilyMember } from '@/components/hooks/useFamilyTree';
import { cn } from '@/lib/utils';

interface MemberCardProps {
    member: FamilyMember;
    isSelected?: boolean;
    isRoot?: boolean;
    isInLaw?: boolean;
    onClick: () => void;
    onAddParent?: () => void;
    onAddSpouse?: () => void;
    onAddChild?: () => void;
    showAddButtons?: boolean;
    hasParents?: boolean;
    hasSpouse?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
    member,
    isSelected,
    isRoot,
    isInLaw = false,
    onClick,
    onAddParent,
    onAddSpouse,
    onAddChild,
    showAddButtons = true,
    hasParents = false,
    hasSpouse = false,
}) => {
    const birthDate = member.birth_date ? new Date(member.birth_date) : null;
    const isDeceased = !!member.death_date;

    const formatBirthDate = () => {
        if (!birthDate) return null;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `b. ${months[birthDate.getMonth()]} ${birthDate.getDate()} ${birthDate.getFullYear()}`;
    };

    return (
        <div className="relative group">
            {showAddButtons && !hasParents && !isRoot && onAddParent && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-md p-0 bg-card border border-border hover:bg-muted shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddParent();
                        }}
                    >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            )}

            <div
                onClick={onClick}
                className={cn(
                    "relative bg-card rounded-lg cursor-pointer transition-all duration-200 w-40 shadow-md hover:shadow-lg border-2",
                    isInLaw
                        ? "border-rose-400"
                        : "border-cyan-400",
                    isSelected && "ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]",
                    isDeceased && "opacity-85"
                )}
            >
                <div className="p-3">
                    <div className="flex justify-center mb-2">
                        <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center overflow-hidden bg-muted relative",
                            member.gender === 'male'
                                ? "bg-blue-100 text-blue-600"
                                : member.gender === 'female'
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-muted text-muted-foreground"
                        )}>
                            {member.photo_url ? (
                                <img
                                    src={member.photo_url}
                                    alt={`${member.first_name} ${member.last_name}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="h-8 w-8 text-muted-foreground/50" />
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="font-semibold text-sm leading-tight text-foreground">
                            {member.first_name} {member.last_name}
                        </h3>

                        {formatBirthDate() && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatBirthDate()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-2 right-2">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>

                {isRoot && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm border-2 border-background">
                        <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                )}

                {isDeceased && (
                    <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-muted rounded-full flex items-center justify-center shadow-sm border-2 border-background">
                        <span className="text-xs">†</span>
                    </div>
                )}
            </div>

            {showAddButtons && onAddChild && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-md p-0 bg-card border border-border hover:bg-muted shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild();
                        }}
                    >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            )}

            {showAddButtons && !hasSpouse && onAddSpouse && (
                <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-md p-0 bg-card border border-border hover:bg-muted shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddSpouse();
                        }}
                    >
                        <Heart className="h-4 w-4 text-rose-400" />
                    </Button>
                </div>
            )}
        </div>
    );
};
