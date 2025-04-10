'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

// Re-define Note type here or import from shared location
interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NoteViewerProps {
  note: Note;
  onEditClick: () => void; // Callback to trigger edit mode
}

export default function NoteViewer({ note, onEditClick }: NoteViewerProps) {

  // Helper to format date/time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  return (
    <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-6 space-y-4">
      {/* Header with Title and Edit Button */}
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold break-words min-w-0">{note.title}</h1>
        <Button variant="outline" size="icon" onClick={onEditClick} aria-label="Edit note" className="flex-shrink-0">
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Note Content */}
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
        {/* Apply prose for basic markdown-like styling if needed, 
                 or just use a <p> if plain text is expected */}
        {note.content || <p className="italic text-muted-foreground">No content.</p>}
      </div>

      {/* Footer with Metadata */}
      <div className="border-t pt-3 mt-4 text-xs text-muted-foreground flex flex-col sm:flex-row sm:justify-between gap-2">
        <span>Created: {formatDateTime(note.created_at)}</span>
        <span>Last Updated: {formatDateTime(note.updated_at)}</span>
      </div>
    </div>
  )
} 