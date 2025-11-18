import { FC, useState, useEffect } from "react";
import { getUserPersona, saveUserPersona, clearUserPersona } from "../utils/persona";
import { CamperTypes } from "../model/taxonomies/camperTypes";

// Map camper type codenames to display names
const PERSONA_DISPLAY_NAMES: Record<string, string> = {
  rv_owner: "RV Camper",
  tent_camper: "Tent Camper",
  family_camper: "Family Camper",
  experienced_camper: "Experienced Camper",
  first_time_camper: "First Time Camper",
  solo_adventurer: "Solo Adventurer",
};

// Filter to only show the three requested personas
const AVAILABLE_PERSONAS: CamperTypes[] = ["rv_owner", "tent_camper", "family_camper"];

const PersonaSelector: FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<CamperTypes | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load persona from cookie on mount
    const savedPersona = getUserPersona();
    if (savedPersona && AVAILABLE_PERSONAS.includes(savedPersona)) {
      setSelectedPersona(savedPersona);
    }
  }, []);

  const handlePersonaSelect = (persona: CamperTypes) => {
    setSelectedPersona(persona);
    saveUserPersona(persona);
    setIsOpen(false);
    // Dispatch custom event to notify components of persona change
    window.dispatchEvent(new CustomEvent('personaChanged', { detail: { persona } }));
  };

  const handleClear = () => {
    setSelectedPersona(null);
    clearUserPersona();
    setIsOpen(false);
    // Dispatch custom event to notify components of persona change
    window.dispatchEvent(new CustomEvent('personaChanged', { detail: { persona: null } }));
  };

  const displayName = selectedPersona ? PERSONA_DISPLAY_NAMES[selectedPersona] || selectedPersona : "Select Persona";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border-2 border-darkGreen p-4 min-w-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">🏕️ Browse As:</h3>
          {selectedPersona && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Clear persona"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left px-3 py-2 bg-mintGreen hover:bg-darkGreen text-white rounded-md text-sm font-medium transition-colors flex items-center justify-between"
          >
            <span>{displayName}</span>
            <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
              {AVAILABLE_PERSONAS.map((persona) => (
                <button
                  key={persona}
                  onClick={() => handlePersonaSelect(persona)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-mintGreen hover:text-white transition-colors ${
                    selectedPersona === persona ? "bg-darkGreen text-white" : "text-gray-900"
                  }`}
                >
                  {PERSONA_DISPLAY_NAMES[persona] || persona}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {selectedPersona && (
          <p className="text-xs text-gray-500 mt-2">
            CTAs will match your persona
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonaSelector;

