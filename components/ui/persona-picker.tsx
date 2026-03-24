"use client";

import * as React from "react";
import { PersonaCard } from "@/components/ui/persona-card";

export interface PersonaOption {
    id: string;
    name: string;
    tone: string;
    description: string;
    unavailable?: boolean;
}

interface PersonaPickerProps {
    personas: PersonaOption[];
    activePersonaId: string;
    onSelect: (personaId: string) => void;
    accentColor?: string;
}

export function PersonaPicker({
    personas,
    activePersonaId,
    onSelect,
    accentColor = "#7c3aed",
}: PersonaPickerProps) {
    return (
        <div className="space-y-3">
            {personas.map((persona) => (
                <PersonaCard
                    key={persona.id}
                    name={persona.name}
                    tone={persona.tone}
                    description={persona.description}
                    unavailable={persona.unavailable}
                    isActive={persona.id === activePersonaId}
                    accentColor={accentColor}
                    onClick={() => onSelect(persona.id)}
                />
            ))}
        </div>
    );
}
