'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import posthog from 'posthog-js'
import { ThemeTogglerButton } from '@/components/animate-ui/components/buttons/theme-toggler'

export function ThemeToggleClient() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handler for theme toggle that tracks the event
  const handleThemeToggle = () => {
    // The new theme will be the opposite of current
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    posthog.capture('theme_toggled', {
      from_theme: theme,
      to_theme: newTheme,
    })
  }

  // Prevents SSR / hydration mismatch
  if (!mounted) return null

  return (
    <ThemeTogglerButton
      size="lg"
      modes={['light', 'dark']}
      direction="ttb"
      onClick={handleThemeToggle}
    />
  )
}
