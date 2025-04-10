'use client' // Required for handling user interactions like input changes and button clicks

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation' // Removed usePathname for now
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient' // Import the Supabase client
import { toast } from 'sonner' // Import toast

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // const [message, setMessage] = useState('') // Keep for potential non-toast messages if needed
  const router = useRouter()
  const isMounted = useRef(true); // Use ref to track mounted state

  // Check session on mount and redirect if already logged in
  useEffect(() => {
    isMounted.current = true;

    const checkSessionAndRedirect = async () => {
      // Give Supabase a moment to potentially initialize session from storage
      await new Promise(resolve => setTimeout(resolve, 50)); 
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted.current) {
        console.log("Login Page: User already logged in, redirecting to /notes");
        router.replace('/notes'); // Redirect to /notes, not /
      }
    };

    checkSessionAndRedirect();

    // Listen for auth changes (e.g., signing in this tab via form)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session && isMounted.current) {
          console.log("Login Page: SIGNED_IN event detected, redirecting to /notes");
          router.replace('/notes'); // Redirect to /notes
        }
      }
    );

    return () => {
      isMounted.current = false;
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // setMessage('')
    setLoading(true)

    console.log("Attempting login for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    console.log("Login Response:", { data, error });

    if (error) {
      console.error('Login error:', error.message)
      toast.error(error.message || 'Failed to log in. Please check your credentials.') // Use toast for errors
      // setMessage('') // Clear local message state if using toast
    } else if (data?.session) {
      console.log("Login successful, session received.");
      toast.success('Login successful!'); // Use toast for success
      // The onAuthStateChange listener should handle the redirect.
      // If issues persist, uncommenting the direct push might be needed, but ideally listener handles it.
      // router.replace('/');
    } else {
      console.error('Login Error: No error but no session data received.');
      toast.error('Login succeeded but failed to retrieve session. Please try again.');
    }

    // Use ref's current value to check if mounted before setting state
    if (isMounted.current) {
        setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">VoiceNote</CardTitle>
          <CardDescription>
            Login to access your voice-to-text notes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}/>
            </div>
             {/* Displaying server message might be redundant if using toasts effectively */}
             {/* {message && <p className="text-sm text-red-600 dark:text-red-400">{message}</p>} */} 
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 pt-4">
             <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Link href="/signup" className="text-sm text-primary hover:underline">
              Don&apos;t have an account? Sign Up
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 