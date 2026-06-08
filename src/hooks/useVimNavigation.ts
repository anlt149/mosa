import { useEffect } from 'react';

export interface VimNavConfig {
  activeSection: 'mood' | 'energy' | 'note' | 'submit';
  setActiveSection: (section: 'mood' | 'energy' | 'note' | 'submit') => void;
  mood: number;
  setMood: (val: number | ((prev: number) => number)) => void;
  energy: number;
  setEnergy: (val: number | ((prev: number) => number)) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function useVimNavigation({
  activeSection,
  setActiveSection,
  mood,
  setMood,
  energy,
  setEnergy,
  onSubmit,
  disabled = false
}: VimNavConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // Avoid triggering navigation if the user is typing in a text field or textarea
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'TEXTAREA' || (activeTag === 'INPUT' && (document.activeElement as HTMLInputElement).type === 'text')) {
        // Allow Escape to blur the text field/textarea and resume Vim navigation
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        // Vertical movement
        case 'j':
          if (activeSection === 'mood') setActiveSection('energy');
          else if (activeSection === 'energy') setActiveSection('note');
          else if (activeSection === 'note') setActiveSection('submit');
          break;
        case 'k':
          if (activeSection === 'submit') setActiveSection('note');
          else if (activeSection === 'note') setActiveSection('energy');
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

        // Form Submission
        case 'Enter':
          if (activeSection === 'submit') {
            onSubmit();
          } else if (activeSection === 'note') {
             // Let them focus the input field
             const noteInput = document.getElementById('note-input');
             if (noteInput) noteInput.focus();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, mood, energy, setMood, setEnergy, setActiveSection, onSubmit, disabled]);
}
