'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import NotesSidebar from '@/components/NotesSidebar'
import { supabase } from '@/lib/supabaseClient'
import { User, Subscription } from '@supabase/supabase-js'
import { NotesProvider } from '@/context/NotesContext'
import { Button } from '@/components/ui/button'
import { Menu, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from "@/components/mode-toggle"
import { toast } from 'sonner'

// Inner layout component
function NotesLayoutContent({ children, user }: { children: React.ReactNode, user: User }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to close sidebar, useful for links and overlay
  const closeSidebar = useCallback(() => {
      setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */} 
      <header className="flex justify-between items-center p-3 border-b bg-card text-card-foreground shadow-sm flex-shrink-0">
        {/* Left side: Hamburger + Title */}
        <div className="flex items-center">
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden mr-2" // Added margin-right
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                aria-label="Toggle menu"
            >
                 {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-bold"> 
                VoiceNote
            </h1>
        </div>
        
        {/* Right side: Welcome, Theme Toggle, Logout */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.email}</span>
          <ModeToggle />
          <LogoutButton />
        </div>
      </header>

      {/* Main layout: Sidebar + Content Area */} 
      <div className="flex flex-1 overflow-hidden relative"> {/* Added relative for absolute sidebar */} 
        
        {/* Overlay for mobile sidebar */} 
        {isSidebarOpen && (
             <div 
                 className="fixed inset-0 bg-black/40 z-10 lg:hidden" // Overlay on mobile
                 onClick={closeSidebar} 
                 aria-hidden="true"
             />
        )}

        {/* Sidebar */} 
        <aside 
            className={cn(
                "fixed inset-y-0 left-0 z-20 w-64 bg-card border-r p-4 overflow-y-auto flex-shrink-0 transition-transform duration-300 ease-in-out",
                "lg:static lg:translate-x-0 lg:border-r lg:bg-background/30 lg:dark:bg-zinc-800/30", // Static positioning on large screens
                isSidebarOpen ? "translate-x-0" : "-translate-x-full" // Slide in/out on mobile
            )}
        >
          {/* Pass closeSidebar to handle link clicks */} 
          <NotesSidebar onLinkClick={closeSidebar} /> 
        </aside>

        {/* Main Content */} 
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto"> 
          {children} 
        </main>
      </div>
    </div>
  )
}

export default function NotesLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let authListenerSubscription: Subscription | null = null;
    const checkUserSession = async () => {
      setLoadingUser(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted.current) return;
        
        if (sessionError) {
            console.error("NotesLayout: Error getting session:", sessionError);
            setUser(null);
            router.push('/login');
        } else if (!session) {
            console.log("NotesLayout: No active session found, redirecting to login.");
            setUser(null);
            router.push('/login');
        } else {
            console.log("NotesLayout: Session found, setting user.");
            setUser(session.user);
        }
      } catch (error: unknown) {
        console.error('Error fetching user session:', error);
        // Check if it's an Error instance before accessing .message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error loading session: ${errorMessage}`);
      } finally {
        setLoadingUser(false);
      }
    };
    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted.current) return;
        const currentUser = session?.user ?? null;
        console.log("NotesLayout: Auth state change detected:", event, "User:", !!currentUser);
        setUser(currentUser);
        if (event === 'SIGNED_OUT' || !currentUser) {
            if (!currentUser) {
                 console.log("NotesLayout: User is null after auth change, redirecting.");
                 router.push('/login');
            }
        }
    });
    authListenerSubscription = authListener?.subscription;

    return () => { 
        isMounted.current = false; 
        if (authListenerSubscription) {
             authListenerSubscription.unsubscribe(); 
             console.log("NotesLayout: Unsubscribed from auth changes.");
        }
    };
  }, [router]);

  if (loadingUser) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
    );
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting to login...</div>;
  }

  return (
    <NotesProvider value={{ user }}>
      <NotesLayoutContent user={user}>{children}</NotesLayoutContent>
    </NotesProvider>
  );
} 