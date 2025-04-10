'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NotebookPen, PlusCircle } from 'lucide-react' // Icons for navigation
import { cn } from '@/lib/utils'

// Define navigation items
const navItems = [
  { href: '/notes', label: 'My Notes', icon: NotebookPen },
  { href: '/notes/new', label: 'New Note', icon: PlusCircle },
];

export default function NavigationSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full p-4 space-y-2">
      <h2 className="text-lg font-semibold mb-2 px-2">Navigation</h2>
      {navItems.map((item) => {
         // Check if the current path starts with the item's href for active state
         // Handle the base '/notes' case separately
         const isActive = 
            item.href === '/notes' 
            ? pathname === '/notes' 
            : pathname.startsWith(item.href);
          
         return (
            <Link href={item.href} key={item.label} legacyBehavior passHref>
                <Button
                    variant={isActive ? 'secondary' : 'ghost'} // Highlight active link
                    className={cn("w-full justify-start", isActive && "text-primary")}
                    asChild={false} // Ensure Button doesn't act as child for Link default behavior
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                </Button>
            </Link>
         );
      })}
       {/* You could add other nav items here later, e.g., Settings, Trash */} 
    </nav>
  );
} 