import React from 'react'
import './styles.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeSwitcher } from '@/components/theme-switcher'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex justify-end p-4">
            <ThemeSwitcher />
          </div>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
