'use client'

import { useEffect, useState } from 'react'
import { ThemeTogglerButton } from '@/components/animate-ui/components/buttons/theme-toggler'

export function ThemeToggleClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevents SSR / hydration mismatch
  if (!mounted) return null

  return <ThemeTogglerButton size="lg" modes={['light', 'dark']} direction="ttb" />
}
