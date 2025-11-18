// Persona utilities for storing and retrieving user persona selection

import { CamperTypes } from "../model/taxonomies/camperTypes";

const COOKIE_NAME = 'user_persona';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Get user persona from cookie
 */
export function getUserPersona(): CamperTypes | null {
  if (typeof document === 'undefined') return null;
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_NAME}=`));
    
  if (!cookie) return null;
  
  try {
    const cookieParts = cookie.split('=');
    if (cookieParts.length < 2 || !cookieParts[1]) return null;
    const value = decodeURIComponent(cookieParts[1]);
    return value as CamperTypes;
  } catch (error) {
    console.warn('Failed to parse user persona cookie:', error);
    return null;
  }
}

/**
 * Save user persona to cookie
 */
export function saveUserPersona(persona: CamperTypes): void {
  if (typeof document === 'undefined') return;
  
  try {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + COOKIE_EXPIRY_DAYS);
    
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(persona)}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Failed to save user persona:', error);
  }
}

/**
 * Clear user persona cookie
 */
export function clearUserPersona(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Check if a CTA matches the user's persona
 */
export function ctaMatchesPersona(ctaPersonaTaxonomy: { value: Array<{ codename: string }> } | undefined, userPersona: CamperTypes | null): boolean {
  if (!userPersona || !ctaPersonaTaxonomy?.value) return false;
  
  return ctaPersonaTaxonomy.value.some(term => term.codename === userPersona);
}

