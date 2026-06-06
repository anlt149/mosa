import { useEffect } from 'react';

export interface VimNavConfig {
  activeSection: 'mood' | 'energy' | 'submit';
  setActiveSection: (section: 'mood' | 'energy' | 'submit') => void;
  mood: number;
  setMood: (val: number | ((prev: number) => number)) => void;
  energy: number;
  setEnergy: (val: number | ((prev: number) => number)) => void;
  onSubmit: () => void;
}

export function useVimNavigation({
  activeSection,
  setActiveSection,
  mood,
  setMood,
  energy,
  setEnergy,
  onSubmit
}: VimNavConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering navigation if the user is typing in a text field
      if (document.activeElement?.tagName === 'INPUT' && (document.activeElement as HTMLInputElement).type === 'text') {
        return;
      }

      switch (e.key) {
        // Vertical movement
        case 'j':
          if (activeSection === 'mood') setActiveSection('energy');
          else if (activeSection === 'energy') setActiveSection('submit');
          break;
        case 'k':
          if (activeSection === 'submit') setActiveSection('energy');
          else if (activeSection === 'energy') setActiveSection('mood');
          break;

        // Horizontal movement (adjusting levels)
        case 'h':
          if (activeSection === 'mood') {
            setMood(prev => Math.max(1, prev - 1));
          } else if (activeSection === 'energy') {
            setEnergy(prev => Math.max(1, prev - 1));
          }
          break;
        case 'l':
          if (activeSection === 'mood') {
            setMood(prev => Math.min(5, prev + 1));
          } else if (activeSection === 'energy') {
            setEnergy(prev => Math.min(10, prev + 1));
          }
          break;

        // Submit form
        case 'Enter':
          if (activeSection === 'submit') {
            onSubmit();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, mood, energy, setMood, setEnergy, setActiveSection, onSubmit]);
}
