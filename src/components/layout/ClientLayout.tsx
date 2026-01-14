'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'

const AuthWrapper = dynamic(() => import('@/components/auth/AuthWrapper'), { ssr: false })

const queryClient = new QueryClient()

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthWrapper>{children}</AuthWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
