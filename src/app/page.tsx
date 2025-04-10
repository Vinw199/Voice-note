'use client' // Convert to Client Component

import { useEffect, useState } from 'react' // Import useEffect and useState
import { useRouter } from 'next/navigation' // Keep router if needed
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient' // Import client-side Supabase
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// This page acts as an entry point. It checks auth status
// and redirects accordingly.
export default function LandingPage() {
    const router = useRouter()
    // State to track if we're checking auth or ready to display
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            setIsLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                // User is logged in, redirect to the main app
                console.log("LandingPage: Session found, redirecting to /notes")
                router.replace('/notes')
                // No need to setLoading(false) as we are navigating away
            } else {
                // User is not logged in, safe to show the landing page
                console.log("LandingPage: No session found, showing landing page.")
                setIsLoading(false)
            }
        }
        checkAuthAndRedirect()
    }, [router])

    // Show loading indicator while checking auth
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
        )
    }

    // Render the Landing Page content if not logged in
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-6 text-center">
            <div className="max-w-2xl flex flex-col items-center">
                {/* Consider adding a simple logo/icon here later */}
                {/* <Mic className="h-16 w-16 mb-6 text-primary" /> */}
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-normal text-foreground">
                    Welcome to VoiceNote
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
                    Effortlessly capture your thoughts with voice-to-text. Record, transcribe, save, and access your notes anytime, anywhere.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                    <Button asChild size="lg" className="w-full sm:w-auto text-base">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base">
                         <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
