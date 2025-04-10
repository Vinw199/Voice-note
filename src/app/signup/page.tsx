'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const checkSessionAndRedirect = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted.current) {
        console.log("Signup Page: User already logged in, redirecting to /notes");
        router.replace('/notes');
      }
    };
    checkSessionAndRedirect();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session && isMounted.current) {
          console.log("Signup Page: SIGNED_IN event detected, redirecting to /notes");
          router.replace('/notes');
        }
      }
    );

    return () => {
      isMounted.current = false;
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    console.log("Signup Response:", { data, error });

    if (error) {
      console.error('Signup error:', error.message)
      toast.error(error.message || 'Failed to create account.')
    } else if (data.user && data.user.identities?.length === 0) {
       if(data.session === null){
         console.log('Signup successful, email confirmation required.');
         toast.success('Account created! Please check your email to confirm your registration.')
       } else {
         console.error('Signup issue: User created but identities array is empty and session exists?');
         toast.error('An issue occurred during signup. Confirmation email might be delayed.');
       }
    } else if (data.session) {
       console.log('Signup successful and session created (auto-confirmed).');
       toast.success('Account created successfully!');
    } else if (data.user && !data.session) {
         console.log('Signup successful, email confirmation required.');
         toast.success('Account created! Please check your email to confirm your registration.')
    }
    else {
      console.error('Unexpected signup response:', { data, error });
      toast.error('An unexpected error occurred during signup.')
    }

    if (isMounted.current) {
        setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">VoiceNote</CardTitle>
          <CardDescription>
             Sign up to start recording voice-to-text notes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
             <Link href="/login" className="text-sm text-primary hover:underline">
              Already have an account? Log In
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 