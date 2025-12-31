'use client'

import { useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'

/**
 * PostHogIdentifier - Identifies users in PostHog when they are signed in via Clerk.
 * This component should be placed inside ClerkProvider but rendered once in the app.
 */
export function PostHogIdentifier() {
  const { user, isLoaded, isSignedIn } = useUser()
  const previousUserIdRef = useRef<string | null>(null)

  // Handle user identification when auth state changes
  // Using ref to track previous user and avoid unnecessary identify calls
  if (isLoaded) {
    if (isSignedIn && user) {
      // Only identify if user changed
      if (previousUserIdRef.current !== user.id) {
        previousUserIdRef.current = user.id

        // Identify user in PostHog
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        })
      }
    } else if (!isSignedIn && previousUserIdRef.current !== null) {
      // User logged out - reset PostHog
      previousUserIdRef.current = null
      posthog.reset()
    }
  }

  return null
}
