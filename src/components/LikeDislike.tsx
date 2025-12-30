'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { ThumbsUp } from '@/components/animate-ui/icons/thumbs-up'
import { ThumbsDown } from '@/components/animate-ui/icons/thumbs-down'
import { Button } from '@/components/animate-ui/primitives/buttons/button'

interface LikeDislikeProps {
  articleId: string | number
}

interface ReactionData {
  likeCount: number
  dislikeCount: number
  userReaction: 'like' | 'dislike' | null
}

export default function LikeDislike({ articleId }: LikeDislikeProps) {
  const { user } = useUser()
  const [data, setData] = useState<ReactionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/article-reaction?articleId=${articleId}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching reaction data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [articleId])

  const handleReaction = async (type: 'like' | 'dislike') => {
    try {
      const response = await fetch('/api/article-reaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId, type }),
      })

      if (response.ok) {
        fetchData() // Refetch data
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>Error loading reactions</div>
  }

  return (
    <div className="flex items-center space-x-4 mt-4">
      {user ? (
        <>
          <button
            className={`flex items-center space-x-2 px-3 py-1 border rounded ${data.userReaction === 'like' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            onClick={() => handleReaction('like')}
          >
            <ThumbsUp size={16} />
            <span>{data.likeCount}</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-3 py-1 border rounded ${data.userReaction === 'dislike' ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
            onClick={() => handleReaction('dislike')}
          >
            <ThumbsDown size={16} />
            <span>{data.dislikeCount}</span>
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <ThumbsUp size={16} />
            <span>{data.likeCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThumbsDown size={16} />
            <span>{data.dislikeCount}</span>
          </div>
        </>
      )}
    </div>
  )
}
