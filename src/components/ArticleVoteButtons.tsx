'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/animate-ui/components/buttons/button'
import { ThumbsUp } from '@/components/animate-ui/icons/thumbs-up'
import { ThumbsDown } from '@/components/animate-ui/icons/thumbs-down'

type ArticleVoteButtonsProps = {
  articleId: string
  likesCount: number
  dislikesCount: number
  userVote: 'like' | 'dislike' | null
}

export function ArticleVoteButtons({
  articleId,
  likesCount: propLikesCount,
  dislikesCount: propDislikesCount,
  userVote: propUserVote,
}: ArticleVoteButtonsProps) {
  const [likesCount, setLikesCount] = useState(propLikesCount)
  const [dislikesCount, setDislikesCount] = useState(propDislikesCount)
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(propUserVote)

  useEffect(() => {
    setLikesCount(propLikesCount)
    setDislikesCount(propDislikesCount)
    setUserVote(propUserVote)
  }, [propLikesCount, propDislikesCount, propUserVote])

  const mutation = useMutation({
    mutationFn: async ({ action }: { action: 'like' | 'dislike' | 'remove' }) => {
      const res = await fetch(`/api/article-vote/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onMutate: async ({ action }) => {
      // Optimistic update
      const prevVote = userVote
      const prevLikes = likesCount
      const prevDislikes = dislikesCount

      if (action === 'like') {
        if (userVote === 'like') {
          setUserVote(null)
          setLikesCount((l) => l - 1)
        } else {
          setUserVote('like')
          setLikesCount((l) => l + 1)
          if (userVote === 'dislike') {
            setDislikesCount((d) => d - 1)
          }
        }
      } else if (action === 'dislike') {
        if (userVote === 'dislike') {
          setUserVote(null)
          setDislikesCount((d) => d - 1)
        } else {
          setUserVote('dislike')
          setDislikesCount((d) => d + 1)
          if (userVote === 'like') {
            setLikesCount((l) => l - 1)
          }
        }
      } else if (action === 'remove') {
        if (userVote === 'like') {
          setUserVote(null)
          setLikesCount((l) => l - 1)
        } else if (userVote === 'dislike') {
          setUserVote(null)
          setDislikesCount((d) => d - 1)
        }
      }

      return { prevVote, prevLikes, prevDislikes }
    },
    onError: (error, variables, context) => {
      // Revert
      if (context) {
        setUserVote(context.prevVote)
        setLikesCount(context.prevLikes)
        setDislikesCount(context.prevDislikes)
      }
    },
    onSuccess: (data) => {
      setLikesCount(data.likesCount)
      setDislikesCount(data.dislikesCount)
    },
  })

  const handleVote = (type: 'like' | 'dislike') => {
    if (mutation.isPending) return

    let action: 'like' | 'dislike' | 'remove'
    if (type === 'like') {
      action = userVote === 'like' ? 'remove' : 'like'
    } else {
      action = userVote === 'dislike' ? 'remove' : 'dislike'
    }

    mutation.mutate({ action })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 'like' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('like')}
        disabled={mutation.isPending}
      >
        <ThumbsUp size={16} />
        {likesCount}
      </Button>
      <Button
        variant={userVote === 'dislike' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('dislike')}
        disabled={mutation.isPending}
      >
        <ThumbsDown size={16} />
        {dislikesCount}
      </Button>
    </div>
  )
}
