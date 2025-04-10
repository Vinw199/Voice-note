'use client'

import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';

interface NotesContextProps {
  user: User | null;
}

const NotesContext = createContext<NotesContextProps | undefined>(undefined);

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = NotesContext.Provider; 