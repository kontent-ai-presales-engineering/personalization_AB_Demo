import { FC, useState, useEffect } from "react";
import { getUserPersona, saveUserPersona, clearUserPersona } from "../utils/persona";
import { getUserLocation, saveUserLocation, getCurrentLocation, clearUserLocation } from "../utils/location";
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Load persona from cookie on mount
    const savedPersona = getUserPersona();
    if (savedPersona && AVAILABLE_PERSONAS.includes(savedPersona)) {
      setSelectedPersona(savedPersona);
    }

    // Load location from cookie on mount
    const savedLocation = getUserLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
    } else {
      // Try to detect location automatically on mount
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        saveUserLocation(location);
        // Dispatch custom event to notify components of location change
        window.dispatchEvent(new CustomEvent('locationChanged', { detail: { location } }));
      } else {
        setLocationError('Location access denied or unavailable');
      }
    } catch (error) {
      setLocationError('Failed to detect location');
      console.error('Location detection error:', error);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    clearUserLocation();
    setLocationError(null);
    // Dispatch custom event to notify components of location change
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: { location: null } }));
  };

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
        
        <div className="relative mb-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left px-3 py-2 bg-mintGreen hover:bg-darkGreen text-white rounded-md text-sm font-medium transition-colors flex items-center justify-between"
          >
            <span>{displayName}</span>
            <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-10">
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
          <p className="text-xs text-gray-500 mb-3">
            CTAs will match your persona
          </p>
        )}

        {/* Location Section */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">📍 Location:</h3>
            {userLocation && (
              <button
                onClick={handleClearLocation}
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Clear location"
              >
                ✕
              </button>
            )}
          </div>
          
          {userLocation ? (
            <div className="text-xs text-gray-600 mb-2">
              <div>Lat: {userLocation.latitude.toFixed(4)}</div>
              <div>Lng: {userLocation.longitude.toFixed(4)}</div>
              <p className="text-green-600 mt-1">✓ Campgrounds sorted by distance</p>
            </div>
          ) : (
            <div className="text-xs text-gray-600 mb-2">
              {locationError ? (
                <p className="text-red-600 mb-2">{locationError}</p>
              ) : (
                <p className="mb-2">No location set</p>
              )}
            </div>
          )}
          
          <button
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetectingLocation ? "Detecting..." : "📍 Detect Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaSelector;

