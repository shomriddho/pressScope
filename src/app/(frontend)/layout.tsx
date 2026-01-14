import React from 'react'
import './index.css'
import ClientLayout from '@/components/layout/ClientLayout'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
