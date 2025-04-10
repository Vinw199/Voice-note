'use client'

import NoteEditor from "@/components/NoteEditor";
import { useNotesContext } from "@/context/NotesContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewNotePage() {
  const { user } = useNotesContext();
  const router = useRouter();

  const handleNoteSaved = () => {
      console.log("NewNotePage: Note saved callback triggered (redirect handled by editor).");
  };

  const handleCancelEdit = () => {
      console.log("NewNotePage: Cancel clicked, navigating to /notes");
      router.push('/notes');
  };

  if (!user) {
    return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      );
  }

  return (
    <NoteEditor 
        user={user} 
        note={null}
        onNoteSaved={handleNoteSaved} 
        onCancelEdit={handleCancelEdit}
    />
  );
} 