'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProfileSectionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    headerTextColor?: string;
    iconWrapperClassName?: string;
    gradientClassName?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function ProfileSection({
    title,
    description,
    icon: Icon,
    headerTextColor,
    iconWrapperClassName,
    gradientClassName,
    children,
    defaultOpen = false,
}: ProfileSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-t-4 border-t-gray-500">
            {/* Gradient strip removed for simpler styling */}
            <CardHeader
                className="pb-4 border-b border-gray-100 bg-white cursor-pointer select-none group"
                onClick={toggleOpen}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full transition-all group-hover:scale-110", iconWrapperClassName)}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className={cn("text-xl transition-colors", headerTextColor)}>
                                {title}
                            </CardTitle>
                            <CardDescription className="mt-1">{description}</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                        {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            {isOpen && (
                <CardContent className="space-y-6 pt-6 bg-white animate-in slide-in-from-top-2 duration-200">
                    {children}
                </CardContent>
            )}
        </Card>
    );
}
