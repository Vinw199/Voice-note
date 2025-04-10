'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNotesContext } from "@/context/NotesContext";
import NoteEditor from "@/components/NoteEditor";
import NoteViewer from "@/components/NoteViewer";
import { NoteEditorSkeleton } from "@/components/NoteEditorSkeleton";
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function EditNotePage() {
  const { user } = useNotesContext();
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchNoteDetails = useCallback(async () => {
    if (!noteId || !user?.id) {
        setIsLoading(false);
        setError("Invalid request parameters.");
        router.push('/notes');
        return;
    }

    console.log("NotePage: Fetching details for note ID:", noteId);
    setIsLoading(true);
    setError(null);
    setNote(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setNote(data as Note);
      } else {
         console.log("NotePage: Note not found or access denied.");
         toast.error("Note not found or you don't have permission.");
         setError("Note not found.");
         router.push('/notes');
      }
    } catch (err: unknown) {
      console.error("NotePage: Unexpected error fetching note:", err);
      const message = err instanceof Error ? err.message : "Failed to load note.";
      toast.error(`Error loading note: ${message}`);
      setError(message);
      router.push('/notes');
    } finally {
      setIsLoading(false);
    }
  }, [noteId, user?.id, router]);

  useEffect(() => {
    fetchNoteDetails();
  }, [fetchNoteDetails]);

  const handleEditClick = () => {
      setIsEditing(true);
  };

  const handleCancelEdit = () => {
      setIsEditing(false);
      fetchNoteDetails();
  };

 

  if (isLoading) {
    return <NoteEditorSkeleton />;
  }

  if (error || !note) {
    return (
         <div className="text-center p-10">
            <p className="text-destructive">{error || "Could not load note."}</p>
            <Button onClick={() => router.push('/notes')} variant="outline" className="mt-4">
                 Back to Notes
             </Button>
        </div>
    );
  }

  if (!user) {
      return <div>Redirecting to login...</div>;
  }

  return (
    <div>
      {isEditing ? (
        <NoteEditor
            user={user}
            note={note}
            onCancelEdit={handleCancelEdit}
        />
      ) : (
        <NoteViewer 
            note={note} 
            onEditClick={handleEditClick} 
        />
      )}
    </div>
  );
}
