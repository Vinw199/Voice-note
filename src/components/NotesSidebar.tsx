'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { List, Plus } from 'lucide-react'

// Define props for the component
interface NotesSidebarProps {
  onLinkClick?: () => void; // Optional callback for when a link is clicked
}

export default function NotesSidebar({ onLinkClick }: NotesSidebarProps) {

  const pathname = usePathname();

  // Helper function to handle link click
  const handleLinkClick = () => {
      if (onLinkClick) {
          onLinkClick(); // Call the callback if it exists
      }
  };

  return (
    <div className="flex flex-col h-full space-y-2 pt-1">
        <Link href="/notes" passHref legacyBehavior>
            <Button 
                asChild
                variant="ghost" 
                className={cn(
                    "w-full justify-start",
                    pathname === '/notes' ? "bg-primary/10 text-primary dark:bg-primary/20" : ""
                )}
                onClick={handleLinkClick}
            >
                <a>
                    <List className="mr-2 h-4 w-4" />
                    Notes
                </a>
            </Button>
        </Link>
        <Link href="/notes/new" passHref legacyBehavior>
             <Button 
                asChild
                variant="ghost" 
                className={cn(
                    "w-full justify-start",
                    pathname === '/notes/new' ? "bg-primary/10 text-primary dark:bg-primary/20" : ""
                )}
                onClick={handleLinkClick}
            >
                <a>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Note
                </a>
            </Button>
        </Link>
    </div>
  );
} 