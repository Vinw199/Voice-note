import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are strings and handle potential undefined values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that environment variables are set
if (!supabaseUrl) {
  console.error('Environment variable NEXT_PUBLIC_SUPABASE_URL is missing!')
  // Consider throwing an error here in production or providing a fallback
  // throw new Error("Missing Supabase URL environment variable.");
}
if (!supabaseAnonKey) {
  console.error('Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!')
  // Consider throwing an error here in production
  // throw new Error("Missing Supabase Anon Key environment variable.");
}

// Create and export the Supabase client instance
// This instance will be used in Client Components
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    // Use localStorage for session persistence in the browser
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Important for OAuth and email confirmation links
  },
})

console.log("Client-side Supabase client initialized."); 