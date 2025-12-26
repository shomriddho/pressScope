import React, { Suspense } from 'react'
import './index.css'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import { ThemeProvider } from 'next-themes'

import { Button } from '@/components/animate-ui/components/buttons/button'

import { ThemeToggleClient } from '@/components/ThemeToggleClient'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <ClerkProvider>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <nav className="flex p-2 px-6 justify-between items-center border-b border-accent-foreground border-dashed bg-background/20 sticky top-0 z-50 backdrop-blur-sm shadow-sm">
              <div></div>
              <div className="flex gap-4 items-center">
                <LanguageSwitcher />

                <ThemeToggleClient />

                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton>
                    <Button variant="outline">Sign In</Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </nav>

            <main>{children}</main>
          </ThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  )
}
