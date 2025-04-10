'use client'

import NotesList from "@/components/NotesList";
import { useNotesContext } from "@/context/NotesContext";

export default function NotesListPage() {
  const { user } = useNotesContext();

  if (!user) {
    // This should technically not happen if layout redirects properly,
    // but good for robustness.
    return <div>Loading user or redirecting...</div>;
  }

  return <NotesList user={user} />;
} 