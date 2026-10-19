import { useEffect, useRef } from 'react';
import { useExamStore } from '@/stores/examStore';

export function useAutosaveExam(delayMs = 2000) {
  const { headerData, questions, pageSettings, saveExamToDatabase } = useExamStore();
  const isInitialMount = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveExamToDatabase().catch((err) => {
        console.warn('Autosave failed:', err);
      });
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [headerData, questions, pageSettings, delayMs, saveExamToDatabase]);
}
