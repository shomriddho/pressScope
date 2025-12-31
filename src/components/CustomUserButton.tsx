'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import posthog from 'posthog-js'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function CustomUserButton() {
  const { user } = useUser()
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  if (!user) return null

  const handleProfileClick = () => {
    posthog.capture('profile_link_clicked', {
      user_id: user.id,
      current_path: pathname,
    })
  }

  const handleSignOutClick = () => {
    posthog.capture('sign_out_clicked', {
      user_id: user.id,
    })
    // Reset PostHog on sign out to unlink future events from this user
    posthog.reset()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.imageUrl} alt={user.firstName || 'User'} />
          <AvatarFallback>
            {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/${locale}/profile/${user.id}`}
            className="flex items-center gap-2"
            onClick={handleProfileClick}
          >
            <User className="size-4" />
            User Info
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SignOutButton>
            <div className="flex items-center gap-2 w-full" onClick={handleSignOutClick}>
              <LogOut className="size-4" />
              Sign Out
            </div>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
