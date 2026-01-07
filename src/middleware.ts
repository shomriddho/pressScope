import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

const locales = ['en', 'bn']
const defaultLocale = 'bn'

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname

  // Check if pathname starts with a locale
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }

  return defaultLocale
}

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl

  logger.info({ pathname }, 'Incoming request')

  // Skip API routes, static files, preview routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/preview/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle locale redirects
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  if (pathnameIsMissingLocale) {
    const locale = getLocale(req)
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url))
  }

  // For ISR routes, set proper cache headers
  const response = NextResponse.next()

  // Only set ISR headers for frontend pages (not admin)
  if (!pathname.startsWith('/admin/')) {
    // Override Clerk's no-cache headers with ISR headers
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate')
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals, admin routes, and static files
    '/((?!_next|admin|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except webhook
    '/((?!api/clerk-webhook))',
    '/(api|trpc)(.*)',
  ],
}
