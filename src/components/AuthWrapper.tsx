'use client'

import React from 'react'
import { ClerkProvider, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'

import { Button } from '@/components/animate-ui/components/buttons/button'

import { ThemeToggleClient } from '@/components/ThemeToggleClient'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import CustomUserButton from '@/components/CustomUserButton'
import Logo from '@/components/Logo'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <ClerkProvider>
      <nav className="flex p-2 px-6 justify-between items-center border-b border-accent-foreground border-dashed bg-background/20 sticky top-0 z-50 backdrop-blur-sm shadow-sm">
        <Logo size="small" />
        <div className="flex gap-4 items-center">
          <LanguageSwitcher />

          <ThemeToggleClient />

          <SignedIn>
            <CustomUserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      <main>{children}</main>
    </ClerkProvider>
  )
}
