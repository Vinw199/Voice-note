'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient' // Use the client-side instance
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
      // Optionally show an error message to the user (e.g., using toast)
    } else {
      // Redirect to login page after successful logout
      router.push('/login')
       // router.refresh() // Optionally refresh to clear any cached user data
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
} 