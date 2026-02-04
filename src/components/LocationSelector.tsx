import React, { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface LocationSelectorProps {
    country: string;
    state: string;
    city: string;
    onLocationChange: (field: 'country' | 'state' | 'city', value: string) => void;
    labels?: {
        country?: string;
        state?: string;
        city?: string;
    };
    layout?: 'grid' | 'stack';
}

export function LocationSelector({ country, state, city, onLocationChange, labels, layout = 'grid' }: LocationSelectorProps) {
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedStateCode, setSelectedStateCode] = useState('');

    const [openCountry, setOpenCountry] = useState(false);
    const [openState, setOpenState] = useState(false);
    const [openCity, setOpenCity] = useState(false);

    const countries = Country.getAllCountries();
    const states = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
    const cities = selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [];

    useEffect(() => {
        if (country) {
            const countryObj = countries.find(c => c.name === country);
            if (countryObj && countryObj.isoCode !== selectedCountryCode) {
                setSelectedCountryCode(countryObj.isoCode);
            }
        } else {
            setSelectedCountryCode('');
        }
    }, [country]);

    useEffect(() => {
        if (state && selectedCountryCode) {
            const stateObj = State.getStatesOfCountry(selectedCountryCode).find(s => s.name === state);
            if (stateObj && stateObj.isoCode !== selectedStateCode) {
                setSelectedStateCode(stateObj.isoCode);
            }
        } else if (!state) {
            setSelectedStateCode('');
        }
    }, [state, selectedCountryCode]);

    const handleCountrySelect = (isoCode: string, name: string) => {
        setSelectedCountryCode(isoCode);
        setSelectedStateCode('');
        onLocationChange('country', name);
        onLocationChange('state', '');
        onLocationChange('city', '');
        setOpenCountry(false);
    };

    const handleStateSelect = (isoCode: string, name: string) => {
        setSelectedStateCode(isoCode);
        onLocationChange('state', name);
        onLocationChange('city', '');
        setOpenState(false);
    };

    const handleCitySelect = (name: string) => {
        onLocationChange('city', name);
        setOpenCity(false);
    };

    const containerInfo = layout === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "space-y-4";

    return (
        <div className={containerInfo}>
            {/* Country */}
            <div className="space-y-2 flex flex-col">
                <Label className="font-medium text-gray-700">{labels?.country || "Country"}</Label>
                <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCountry}
                            className="h-11 justify-between border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] bg-gray-50/50"
                        >
                            {country ? country : "Select Country"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    {countries.map((c) => (
                                        <CommandItem
                                            key={c.isoCode}
                                            value={c.name}
                                            onSelect={() => handleCountrySelect(c.isoCode, c.name)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    country === c.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {c.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* State */}
            <div className="space-y-2 flex flex-col">
                <Label className="font-medium text-gray-700">{labels?.state || "State"}</Label>
                <Popover open={openState} onOpenChange={setOpenState}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openState}
                            disabled={!selectedCountryCode}
                            className="h-11 justify-between border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] bg-gray-50/50"
                        >
                            {state ? state : "Select State"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandList>
                                <CommandEmpty>No state found.</CommandEmpty>
                                <CommandGroup>
                                    {states.map((s) => (
                                        <CommandItem
                                            key={s.isoCode}
                                            value={s.name}
                                            onSelect={() => handleStateSelect(s.isoCode, s.name)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    state === s.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {s.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* City */}
            <div className="space-y-2 flex flex-col">
                <Label className="font-medium text-gray-700">{labels?.city || "City"}</Label>
                <Popover open={openCity} onOpenChange={setOpenCity}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCity}
                            disabled={!selectedStateCode}
                            className="h-11 justify-between border-gray-200 focus:border-[var(--color-kutumba-teal)] focus:ring-[var(--color-kutumba-teal)] bg-gray-50/50"
                        >
                            {city ? city : "Select City"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search city..." />
                            <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                    {cities.map((c) => (
                                        <CommandItem
                                            key={c.name}
                                            value={c.name}
                                            onSelect={() => handleCitySelect(c.name)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    city === c.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {c.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
