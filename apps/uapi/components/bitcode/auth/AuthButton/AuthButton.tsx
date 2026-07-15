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

  const handleConnect = () => {
    // No separate login page; open Connect surface from home.
    router.push('/')
    openAuxillaries('ConnectWindow')
  }

  if (loading) {
    return (
      <button
        className="rounded-none bg-gray-700 px-4 py-2 text-sm font-medium text-white opacity-50"
        disabled
      >
        Loading...
      </button>
    )
  }

  const handleDisconnect = async () => {
    await supabase.auth.signOut()
    // Open connect pane and redirect off authed routes
    openAuxillaries('ConnectWindow')
    router.replace('/')
  }

  return user ? (
    <ExecuteButton
      isProcessing={false}
      onSubmit={handleDisconnect}
      disabled={false}
      label="Disconnect"
      compact
      className="!w-auto !max-w-none px-6 py-4 text-lg tracking-wider font-light"
    />
  ) : (
    <ExecuteButton
      isProcessing={false}
      onSubmit={handleConnect}
      disabled={false}
      label="Connect"
      compact
      className="!w-auto !max-w-none px-6 py-4 text-lg tracking-wider font-light"
    />
  )
}
