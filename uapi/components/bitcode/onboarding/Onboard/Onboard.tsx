import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { BITCODE_GITHUB_APP_PUBLIC_URL } from "@/lib/github-app-url";

export const useOnboardCTA = () => {
  const { user } = useUser()
  const [text, setText] = useState('Get Started')
  const [href, setHref] = useState('SIGNIN')
  const subscriptionFlowEnabled = false

  // 1. sign in 2. pay 3. install
  useEffect(() => {
    if (user) {
      const { publicMetadata: { isCustomer, isInstalled }, ...t } = user
      console.log(t)

      // V26 keeps acquisition wallet-native; onboarding only steers to sign-in or installation surfaces.
      if (subscriptionFlowEnabled) {
        setText('Mint Bitcode')
        setHref('SUBSCRIBE')
      } else {
        if (isInstalled) {
          setText('Configure App')
        } else {
          setText('Install App')
        }
        setHref(BITCODE_GITHUB_APP_PUBLIC_URL)
      }
    } else {
      setText('Get Started')
      setHref('SIGNIN')
    }
  }, [subscriptionFlowEnabled, user])

  return { text, href }
}
