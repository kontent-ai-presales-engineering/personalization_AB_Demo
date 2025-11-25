import React, { useState, useEffect, useCallback } from "react";
import { ABCTA, CallToAction } from "../model";
import CallToActionComponent from "./CallToAction";
import { createItemSmartLink, createElementSmartLink } from "../utils/smartlink";
import { getUserPersona, ctaMatchesPersona } from "../utils/persona";

type ABCTAProps = {
  abCta: ABCTA;
  isPreview?: boolean;
};

const ABCTAComponent: React.FC<ABCTAProps> = ({ abCta, isPreview = false }) => {
  const [selectedCta, setSelectedCta] = useState<"A" | "B" | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the CTAs
  const ctaA = abCta.elements.cta_a.linkedItems[0] as CallToAction;
  const ctaB = abCta.elements.cta_b.linkedItems[0] as CallToAction;

  // Function to select CTA based on persona
  const selectCTABasedOnPersona = useCallback(() => {
    const userPersona = getUserPersona();
    
    if (userPersona) {
      // Check which CTA matches the user's persona
      const ctaAMatches = ctaMatchesPersona(ctaA?.elements.persona, userPersona);
      const ctaBMatches = ctaMatchesPersona(ctaB?.elements.persona, userPersona);
      
      if (ctaAMatches && !ctaBMatches) {
        setSelectedCta("A");
      } else if (ctaBMatches && !ctaAMatches) {
        setSelectedCta("B");
      } else if (ctaAMatches && ctaBMatches) {
        // Both match - prefer A, or could randomize
        setSelectedCta("A");
      } else {
        // Neither matches - fallback to random (or could show default)
        const randomChoice = Math.random() < 0.5 ? "A" : "B";
        setSelectedCta(randomChoice);
      }
    } else {
      // No persona selected - random selection (original behavior)
      const randomChoice = Math.random() < 0.5 ? "A" : "B";
      setSelectedCta(randomChoice);
    }
  }, [ctaA, ctaB]);

  // Select CTA based on persona cookie on mount
  useEffect(() => {
    if (!isInitialized) {
      selectCTABasedOnPersona();
      setIsInitialized(true);
    }
  }, [isPreview, isInitialized, selectCTABasedOnPersona]);

  // Listen for persona changes
  useEffect(() => {
    const handlePersonaChange = () => {
      selectCTABasedOnPersona();
    };

    window.addEventListener('personaChanged', handlePersonaChange);
    return () => {
      window.removeEventListener('personaChanged', handlePersonaChange);
    };
  }, [selectCTABasedOnPersona]);

  if (!ctaA || !ctaB) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: Missing CTA A or CTA B
      </div>
    );
  }

  if (!selectedCta || !isInitialized) {
    return null; // Don't render until initialized
  }

  const currentCta = selectedCta === "A" ? ctaA : ctaB;

  const renderCTA = (cta: CallToAction, variant: "A" | "B") => (
    <div key={`cta-${variant}`}>
      <CallToActionComponent
        title={cta.elements.headline.value}
        description={cta.elements.subheadline.value}
        buttonText={cta.elements.button_label.value}
        buttonHref={cta.elements.button_link.linkedItems[0]?.elements.url.value ?? ""}
        imageSrc={cta.elements.image.value[0]?.url}
        imageAlt={cta.elements.image.value[0]?.description ?? "alt"}
        imagePosition={cta.elements.image_position.value[0]?.codename ?? "left"}
        style={cta.elements.style?.value[0]?.codename === "mint_green" ? "mintGreen" : "white"}
        componentId={cta.system.id}
        componentName={cta.system.name}
      />
    </div>
  );

  return (
    <div
      {...createItemSmartLink(abCta.system.id)}
      {...createElementSmartLink("cta_a")}
    >
      {/* Render Selected CTA */}
      {isInitialized && renderCTA(currentCta, selectedCta)}
    </div>
  );
};

export default ABCTAComponent;
