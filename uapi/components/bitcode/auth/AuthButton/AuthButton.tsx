'use client'

import { createClient } from '@bitcode/supabase/ssr/client'
import { openAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import ExecuteButton from '@/components/bitcode/pipeline/ExecuteButton/ExecuteButton'

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        router.refresh()
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleLogin = () => {
    // No separate login page; redirect to home and open login modal
    router.push('/')
  }

  if (loading) {
    return (
      <button
        className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white opacity-50"
        disabled
      >
        Loading...
      </button>
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Open login pane and redirect off authed routes
    openAuxillaries('SignInWindow')
    router.replace('/')
  }

  return user ? (
    <ExecuteButton
      isProcessing={false}
      onSubmit={handleLogout}
      disabled={false}
      label="Logout"
      compact
      className="!w-auto !max-w-none px-6 py-4 text-lg tracking-wider font-light"
    />
  ) : (
    <ExecuteButton
      isProcessing={false}
      onSubmit={handleLogin}
      disabled={false}
      label="Login"
      compact
      className="!w-auto !max-w-none px-6 py-4 text-lg tracking-wider font-light"
    />
  )
}
