'use client'

import React from 'react'
import { ClerkProvider, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import posthog from 'posthog-js'

import { Button } from '@/components/animate-ui/components/buttons/button'

import { ThemeToggleClient } from '@/components/ThemeToggleClient'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import CustomUserButton from '@/components/CustomUserButton'
import Logo from '@/components/Logo'
import { PostHogIdentifier } from '@/components/PostHogIdentifier'

interface AuthWrapperProps {
  children: React.ReactNode
}

function SignInButtonWithTracking() {
  const handleSignInClick = () => {
    posthog.capture('sign_in_clicked', {
      location: 'navbar',
    })
  }

  return (
    <SignInButton>
      <Button variant="outline" onClick={handleSignInClick}>
        Sign In
      </Button>
    </SignInButton>
  )
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <ClerkProvider>
      <PostHogIdentifier />
      <nav className="flex p-2 px-6 justify-between items-center border-b border-accent-foreground border-dashed bg-background/20 sticky top-0 z-50 backdrop-blur-sm shadow-sm">
        <Logo size="small" />
        <div className="flex gap-4 items-center">
          <LanguageSwitcher />

          <ThemeToggleClient />

          <SignedIn>
            <CustomUserButton />
          </SignedIn>
          <SignedOut>
            <SignInButtonWithTracking />
          </SignedOut>
        </div>
      </nav>

      <main>{children}</main>
    </ClerkProvider>
  )
}
