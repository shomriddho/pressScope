'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/animate-ui/components/buttons/button'

interface GeneralTabClientProps {
  initialUserData: {
    id: string
    username?: string | null
    email: string
    imageUrl?: string | null
  }
}

export default function GeneralTabClient({ initialUserData }: GeneralTabClientProps) {
  const { user, isLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(initialUserData.username || '')

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  const isOwner = user && user.id === initialUserData.id

  const handleSave = async () => {
    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initialUserData.id,
          username,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        // Optionally refresh the page or update state
        window.location.reload()
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <p className="text-sm text-muted-foreground">{initialUserData.email}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Username</label>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border px-3 py-1.5 text-sm w-full"
              placeholder="Enter your username"
            />
            <div className="space-x-2">
              <Button onClick={handleSave} size="sm">
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">{initialUserData.username || 'N/A'}</p>
            {isOwner && (
              <button onClick={() => setIsEditing(true)} className="text-primary text-sm underline">
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
