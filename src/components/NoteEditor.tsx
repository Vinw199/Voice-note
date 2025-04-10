'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { Mic, Square, Save, Loader2, MicOff } from 'lucide-react'

// Define Note type here or import from a shared location
interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CustomSpeechRecognition extends EventTarget { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; abort(): void; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null; }
const SpeechRecognition = (typeof window !== 'undefined') && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

// Updated props for NoteEditor
interface NoteEditorProps {
  user: User;
  note: Note | null; // Allow null for new notes
  onNoteSaved: (noteId: string) => void; // Callback with saved note ID
  onCancelEdit: () => void;
}

export default function NoteEditor({
  user,
  note, // Receive note object as prop
  onNoteSaved,
  onCancelEdit, 
}: NoteEditorProps) {
  const router = useRouter(); 
  // Initialize state from the passed note prop
  const [noteTitle, setNoteTitle] = useState(note?.title || '');
  const [noteContent, setNoteContent] = useState(note?.content || '');
  // Removed isLoadingNote state - parent handles loading
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const isMounted = useRef(true); 

  // Effect to sync state if the note prop changes (e.g., navigating between editors)
  useEffect(() => {
      setNoteTitle(note?.title || '');
      setNoteContent(note?.content || '');
       // Stop recording if the note context changes
      if (isRecording && recognitionRef.current) {
          handleStopRecording();
      }
      // Reset saving state if note changes
      setIsSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]); // Depend only on the note object

  // Effect for mount/unmount cleanup
  useEffect(() => {
      isMounted.current = true;
      return () => { 
          isMounted.current = false; 
          if (recognitionRef.current) {
              recognitionRef.current.stop();
          }
      };
  }, []);

  // Initialize Speech Recognition (remains the same)
  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported by this browser.');
      return;
    }
    const recognition = new SpeechRecognition() as CustomSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (isMounted.current) {
             setNoteContent(prev => prev + (prev.length > 0 && finalTranscript.length > 0 ? ' ' : '') + finalTranscript);
        }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition error.';
        if (event.error === 'no-speech') errorMessage = 'No speech detected.';
        else if (event.error === 'audio-capture') errorMessage = 'Microphone error.';
        else if (event.error === 'not-allowed') errorMessage = 'Microphone access denied.';
        else if (event.error === 'network') errorMessage = 'Network error during recognition.';
        toast.error(errorMessage);
         if (isMounted.current) setIsRecording(false);
    };
    recognition.onend = () => {
        console.log("Speech recognition service ended.");
         if (isMounted.current) {
             // setIsRecording(false); // Let manual stop handle state
         }
    };
    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }

  }, []);

  // Recording Handlers (remain the same)
  const handleStartRecording = () => {
    if (!recognitionRef.current || !SpeechRecognition) {
        toast.error("Speech recognition not available.");
        return;
    }
    if (isRecording) return;
    try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info("Recording started...");
    } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Could not start recording.");
        setIsRecording(false);
    }
  };
  const handleStopRecording = useCallback(() => {
    if (!recognitionRef.current || !isRecording) return;
    recognitionRef.current.stop();
    setIsRecording(false);
    toast.info("Recording stopped.");
  }, [isRecording]);

  // Save/Update Handler - Modified to use note prop
  const handleSaveOrUpdateNote = async () => {
    if (!user?.id) {
        toast.error("User not authenticated.");
        return;
    }
    if (!noteTitle.trim()) {
        toast.error("Please enter a title.");
        return;
    }

    setIsSaving(true);
    const noteData = {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        user_id: user.id,
    };

    try {
        let savedNoteId: string | null = note?.id || null; // Use ID from prop if updating

        if (note && note.id) { // Check if we are updating (note object exists)
            // Update existing note
            console.log("Updating note:", note.id);
            const { error: updateError } = await supabase
                .from('notes')
                .update({ ...noteData, updated_at: new Date().toISOString() })
                .eq('id', note.id)
                .eq('user_id', user.id);
            if (updateError) throw updateError;
            // savedNoteId is already set
        } else {
            // Insert new note
            console.log("Inserting new note");
            const { data: insertData, error: insertError } = await supabase
                .from('notes')
                .insert(noteData)
                .select('id')
                .single();
            if (insertError) throw insertError;
            savedNoteId = insertData?.id ?? null;
        }

        if (!isMounted.current) return;

        if (savedNoteId) {
            // If creating a NEW note, redirect directly to the new note's page
            router.push(`/notes/${savedNoteId}`);
        } else {
            // Fallback if somehow a new note was saved but ID wasn't returned
            router.push('/notes');
        }
    } catch (err: unknown) {
        console.error("Unexpected error saving note:", err);
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast.error(message);
    } finally {
        if (isMounted.current) setIsSaving(false);
    }
  };

  // Handler for Cancel button - Call the callback
  const handleCancel = () => {
      console.log("Cancel edit clicked");
      onCancelEdit(); // Call parent's cancel handler
  };

  // Render the editor form
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="note-title" className="text-base font-medium">Title</Label>
          <Input 
            id="note-title"
            type="text" 
            placeholder="Enter note title..."
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            disabled={isSaving}
            className="text-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="note-content" className="text-base font-medium">Content</Label>
          <div>
            <div className="flex items-center space-x-3 h-9">
              {SpeechRecognition ? (
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button
                              variant={isRecording ? "destructive" : "outline"}
                              size="icon"
                              onClick={isRecording ? handleStopRecording : handleStartRecording}
                              disabled={isSaving}
                              className="flex-shrink-0"
                              aria-label={isRecording ? "Stop Recording" : "Start Recording"}
                          >
                              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>{isRecording ? "Stop Recording" : "Start Recording"}</p>
                      </TooltipContent>
                  </Tooltip>
               ) : (
                 <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="flex-shrink-0 cursor-not-allowed opacity-60" disabled tabIndex={-1}>
                               <MicOff className="h-4 w-4 text-muted-foreground" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Speech recognition not supported.</p>
                      </TooltipContent>
                  </Tooltip>
               )}
              {isRecording && <span className="text-sm text-primary animate-pulse">Recording...</span>}
            </div>
            
            {/* Conditional Hint Text - Hide on larger screens */} 
            {SpeechRecognition && !isRecording && (
                 <p className="text-xs text-muted-foreground mt-1.5 lg:hidden">Tap the microphone to start recording.</p>
            )}
            {/* Hint for unsupported state - Hide on larger screens */}
            {!SpeechRecognition && (
                 <p className="text-xs text-muted-foreground mt-1.5 lg:hidden">Voice input is not supported by your browser.</p>
            )}
          </div>
          <Textarea
            id="note-content"
            placeholder={
                isRecording 
                    ? "Listening... Speak now!" 
                    : SpeechRecognition 
                        ? "Tap the mic above or type here..."
                        : "Type your note here..."
            }
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={15}
            disabled={isSaving || isRecording}
            className="resize-none border border-input rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-ring mt-1"
          />
        </div>
        
        <div className="flex justify-start items-center space-x-3 pt-2">
          <Button 
            onClick={handleSaveOrUpdateNote} 
            disabled={isSaving || isRecording || !noteTitle.trim()}
            size="lg"
          >
            {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            {isSaving ? 'Saving...' : (note ? 'Update Note' : 'Save Note')}
          </Button>
          
          <Button 
              variant="outline" 
              size="lg"
              onClick={handleCancel}
              disabled={isSaving}
          >
              Cancel
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
} 