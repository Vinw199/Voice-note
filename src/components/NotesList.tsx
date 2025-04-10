'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useDebounce } from 'use-debounce'
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, Trash2, FileText, PlusCircle } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { type User } from '@supabase/supabase-js'
import { cn } from "@/lib/utils"
import { NoteListItemSkeleton } from "./NoteListItemSkeleton"

// Define the Note type needed for the list - Added content
interface NoteListItem {
  id: string;
  title: string;
  content: string; // Added content field
  updated_at: string;
}

interface NotesListProps {
  user: User;
}

// Helper function to format date
const formatDateShort = (dateString: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric' // Added year for clarity
    });
  } catch (_) {
    return '';
  }
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

export default function NotesList({ user }: NotesListProps) {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
  const isMounted = useRef(true);

  // --- Data Fetching (Modified for Search) ---
  const fetchNotes = useCallback(async (query: string) => {
    if (!user?.id || !isMounted.current) return;
    console.log(`NotesList: Fetching notes for user: ${user.id}, Query: "${query}"`);
    setLoadingNotes(true);
    try {
      let queryBuilder = supabase
        .from('notes')
        .select('id, title, content, updated_at')
        .eq('user_id', user.id)

      // Add search filter if query exists
      if (query) {
        // Using ilike for case-insensitive search on title
        queryBuilder = queryBuilder.ilike('title', `%${query}%`)
      }

      // Always order by updated_at
      queryBuilder = queryBuilder.order('updated_at', { ascending: false });

      const { data, error } = await queryBuilder;

      if (!isMounted.current) return;

      if (error) {
        console.error("NotesList: Error fetching notes:", error);
        toast.error(`Failed to fetch notes: ${error.message}`);
        setNotes([]);
      } else {
        console.log("NotesList: Fetched notes data:", data);
        setNotes(data || []);
      }
    } catch (_e) {
        console.error("NotesList: Unexpected error fetching notes:", _e);
        toast.error("An unexpected error occurred while fetching notes.");
        if (isMounted.current) setNotes([]);
    } finally {
      if (isMounted.current) setLoadingNotes(false);
    }
  }, [user?.id]);

  // Effect to fetch notes when debounced search term changes
  useEffect(() => {
    if (user?.id) { // Only fetch if user is available
        fetchNotes(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, user?.id, fetchNotes]);

  // Effect for mount/unmount cleanup
  useEffect(() => {
     isMounted.current = true;
     return () => { isMounted.current = false; };
  }, []);

  // --- Event Handlers ---
  const handleDeleteNote = async (noteId: string) => {
      if (!user?.id) return;
      console.log("NotesList: Attempting to delete note:", noteId);
      setIsDeleting(noteId);

      try {
          const { error } = await supabase
              .from('notes')
              .delete()
              .eq('id', noteId)
              .eq('user_id', user.id);

          if (error) {
              console.error("NotesList: Error deleting note:", error);
              toast.error(`Failed to delete note: ${error.message}`);
          } else {
              toast.success("Note deleted successfully!");
              if (isMounted.current) {
                 // Refetch with current debounced term after delete
                 fetchNotes(debouncedSearchTerm);
              }
          }
      } catch (_e) {
          console.error("NotesList: Unexpected error deleting note:", _e);
          toast.error("An unexpected error occurred while deleting the note.");
      } finally {
          if (isMounted.current) {
             setIsDeleting(null);
          }
      }
  };

  // Clear search input
  const handleClearSearch = () => {
      setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
      
      {/* Search Input */}
      <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10" // Padding left for icon, right for clear button
          />
          {searchTerm && (
              <Button 
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                  title="Clear search"
              >
                  <X className="h-4 w-4" />
              </Button>
          )}
      </div>

      {/* Notes List Area */} 
      <ScrollArea className="flex-1 -mr-4 pr-4"> 
          <div className="space-y-3 pb-4"> 
              {loadingNotes ? (
                  // Render multiple skeletons
                  Array.from({ length: 4 }).map((_, index) => (
                     <NoteListItemSkeleton key={index} />
                  ))
              ) : notes.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed rounded-lg flex flex-col items-center space-y-3 text-muted-foreground">
                  {debouncedSearchTerm ? (
                      <>
                          <Search className="h-10 w-10" />
                          <h3 className="text-lg font-medium text-foreground/80">
                              No Notes Found
                          </h3>
                          <p className="text-sm mt-1 max-w-xs">
                              {`Your search for "${debouncedSearchTerm}" did not return any results.`}
                          </p>
                      </>
                  ) : (
                      <>
                          <FileText className="h-10 w-10" />
                          <h3 className="text-lg font-medium text-foreground/80">
                              No Notes Yet
                          </h3>
                          <p className="text-sm mt-1 max-w-xs">
                               Get started by creating your first voice note.
                          </p>
                          <Button asChild size="sm" className="mt-2">
                              <Link href="/notes/new">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Create Note
                              </Link>
                          </Button>
                      </>
                  )}
              </div>
              ) : (
              notes.map((note) => (
                   <div key={note.id} className="flex items-center group border rounded-lg bg-card text-card-foreground shadow-sm transition-all duration-150 hover:shadow-md overflow-hidden"> 
                      <Link href={`/notes/${note.id}`} className="flex-1 p-4 block cursor-pointer min-w-0" passHref> 
                          <div className="flex justify-between items-start mb-1.5 gap-2">
                              <h3 className="font-semibold text-base min-w-0 mr-2" title={note.title || "Untitled Note"}>{note.title || "Untitled Note"}</h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{formatDateShort(note.updated_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2"> 
                              {note.content ? truncateText(note.content, 100) : <span className="italic">No content</span>}
                          </p>
                      </Link>
                      <div className="p-2 pl-1 border-l flex-shrink-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150"> 
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                      disabled={isDeleting === note.id}
                                      onClick={(e) => e.stopPropagation()} 
                                      title="Delete note"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the note &quot;{note.title}&quot;.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleDeleteNote(note.id);
                                          }}
                                          disabled={!!isDeleting}
                                          className={cn(buttonVariants({ variant: 'destructive' }))}
                                      >
                                          {isDeleting === note.id ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  </div>
              ))
              )}
          </div>
      </ScrollArea>
    </div>
  );
} 