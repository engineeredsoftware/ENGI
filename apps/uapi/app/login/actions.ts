'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@bitcode/supabase/ssr/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const next = (formData.get('next') as string) || '/'
  const supabase = await createClient()

  // Send a one-time passcode (OTP) to the user's email. The client is expected
  // to prompt for the code and call `verifyOtp` to complete authentication.
  // Also include a magic-link pointing to our unified /tps/supabase/callback handler.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      // Override the default confirmation URL so the email
      // contains a link to our unified /tps/supabase/callback page
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/tps/supabase/callback`,
    },
  })

  if (error) {
    // Redirect to home with error query (login page removed)
    return redirect('/?error=' + encodeURIComponent(error.message))
  }

  // No session has been established yet – the user must verify the OTP that
  // was just emailed. Re-render the current view (which is expected to show an
  // "enter the code" UI) instead of redirecting elsewhere.

  revalidatePath('/', 'layout')
  return redirect(next)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return redirect('/')
}
