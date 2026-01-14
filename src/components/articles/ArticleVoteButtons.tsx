'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { Button } from '@/components/animate-ui/components/buttons/button'
import { ThumbsUp } from '@/components/animate-ui/icons/thumbs-up'
import { ThumbsDown } from '@/components/animate-ui/icons/thumbs-down'
import { AnimateIcon } from '@/components/animate-ui/icons/icon'

type ArticleVoteButtonsProps = {
  articleId: string
}

export function ArticleVoteButtons({ articleId }: ArticleVoteButtonsProps) {
  const queryClient = useQueryClient()

  const { data: votesData, isLoading: votesLoading } = useQuery({
    queryKey: ['article-votes', articleId],
    queryFn: async () => {
      const res = await fetch(`/api/article-votes/${articleId}`)
      if (!res.ok) throw new Error('Failed to fetch votes')
      return res.json()
    },
  })

  const { data: userVoteData, isLoading: userVoteLoading } = useQuery({
    queryKey: ['article-user-vote', articleId],
    queryFn: async () => {
      const res = await fetch(`/api/article-user-vote/${articleId}`)
      if (!res.ok) throw new Error('Failed to fetch user vote')
      return res.json()
    },
  })

  const likesCount = votesData?.likesCount ?? 0
  const dislikesCount = votesData?.dislikesCount ?? 0
  const userVote = userVoteData?.voteType ?? null

  const mutation = useMutation({
    mutationFn: async ({ action }: { action: 'like' | 'dislike' | 'remove' }) => {
      const res = await fetch(`/api/article-user-vote/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed to vote')
      return res.json()
    },
    onMutate: async ({ action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['article-votes', articleId] })
      await queryClient.cancelQueries({ queryKey: ['article-user-vote', articleId] })

      // Snapshot previous values
      const previousVotes = queryClient.getQueryData(['article-votes', articleId])
      const previousUserVote = queryClient.getQueryData(['article-user-vote', articleId])

      // Compute optimistic updates
      let newVoteType: 'like' | 'dislike' | null = userVote
      let newLikes = likesCount
      let newDislikes = dislikesCount

      if (action === 'remove') {
        newVoteType = null
        if (userVote === 'like') newLikes -= 1
        else if (userVote === 'dislike') newDislikes -= 1
      } else if (action === 'like') {
        if (userVote === 'like') {
          newVoteType = null
          newLikes -= 1
        } else {
          newVoteType = 'like'
          newLikes += 1
          if (userVote === 'dislike') newDislikes -= 1
        }
      } else if (action === 'dislike') {
        if (userVote === 'dislike') {
          newVoteType = null
          newDislikes -= 1
        } else {
          newVoteType = 'dislike'
          newDislikes += 1
          if (userVote === 'like') newLikes -= 1
        }
      }

      // Optimistically update cache
      queryClient.setQueryData(['article-votes', articleId], {
        likesCount: newLikes,
        dislikesCount: newDislikes,
      })
      queryClient.setQueryData(['article-user-vote', articleId], { voteType: newVoteType })

      // Return context for rollback
      return { previousVotes, previousUserVote }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousVotes) {
        queryClient.setQueryData(['article-votes', articleId], context.previousVotes)
      }
      if (context?.previousUserVote) {
        queryClient.setQueryData(['article-user-vote', articleId], context.previousUserVote)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['article-votes', articleId] })
      queryClient.invalidateQueries({ queryKey: ['article-user-vote', articleId] })
    },
  })

  const handleVote = (type: 'like' | 'dislike') => {
    if (mutation.isPending || votesLoading || userVoteLoading) return

    let action: 'like' | 'dislike' | 'remove'
    if (type === 'like') {
      action = userVote === 'like' ? 'remove' : 'like'
    } else {
      action = userVote === 'dislike' ? 'remove' : 'dislike'
    }

    // Track vote actions with PostHog
    if (action === 'like') {
      posthog.capture('article_liked', {
        article_id: articleId,
        previous_vote: userVote,
      })
    } else if (action === 'dislike') {
      posthog.capture('article_disliked', {
        article_id: articleId,
        previous_vote: userVote,
      })
    } else if (action === 'remove') {
      posthog.capture('article_vote_removed', {
        article_id: articleId,
        removed_vote_type: userVote,
      })
    }

    mutation.mutate({ action })
  }

  if (votesLoading || userVoteLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === 'like' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('like')}
        disabled={mutation.isPending}
      >
        <AnimateIcon animateOnHover="default" animateOnTap="default">
          <ThumbsUp size={16} />
        </AnimateIcon>
        {likesCount}
      </Button>
      <Button
        variant={userVote === 'dislike' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('dislike')}
        disabled={mutation.isPending}
      >
        <AnimateIcon animateOnHover="default" animateOnTap="default">
          <ThumbsDown size={16} />
        </AnimateIcon>
        {dislikesCount}
      </Button>
    </div>
  )
}
